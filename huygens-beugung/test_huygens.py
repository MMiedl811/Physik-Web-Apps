"""Browser regression: python3 huygens-beugung/test_huygens.py [--url URL].
Requires Playwright + Chromium. Evidence defaults to /tmp/huygens-fix-evidence.
Tests the actual canvas calls as well as the public deterministic model hook.
"""
import argparse
import json
import math
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default=Path(__file__).with_name('index.html').as_uri())
parser.add_argument('--out', default='/tmp/huygens-fix-evidence')
parser.add_argument('--baseline', action='store_true')
args = parser.parse_args()
out = Path(args.out)
out.mkdir(parents=True, exist_ok=True)
report = {'url': args.url, 'cases': [], 'screenshots': [], 'errors': []}
H = 'window.__HUYGENS_TEST__'

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.on('pageerror', lambda e: report['errors'].append(str(e)))
    page.goto(args.url)
    page.wait_for_function(f'{H} !== undefined')
    page.evaluate(f'{H}.reset()')
    # Capture only one synchronous real render, never a stale global result.
    def drawing():
        return page.evaluate('''() => {
          const proto=CanvasRenderingContext2D.prototype, arc=proto.arc;
          const arcs=[];
          proto.arc=function(...a){arcs.push({args:a,style:this.strokeStyle});return arc.apply(this,a)};
          let g;try{g=window.__HUYGENS_TEST__.render()}finally{proto.arc=arc}
          return {g,arcs:arcs.filter(a=>a.style.startsWith('rgba(243, 195, 108')), envelopes:arcs.filter(a=>a.style==='#b8fff2')};
        }''')

    def setup(mode, step=4, **values):
        page.evaluate(f'{H}.reset()')
        page.evaluate(f'(s)=>{H}.setState(s)', {'mode': mode, 'step': step, 'running': False, **values})

    # Reproduce the original: four emitted generations, only two drawn.
    for mode in ['diff', 'refl']:
        setup(mode)
        page.evaluate(f'{H}.advance(22)')
        d = drawing()
        expected = sum(len(e['circles']) if mode == 'refl' else len(d['g']['sources']) for e in d['g']['outgoing'])
        report['cases'].append({'mode': mode, 'kind': 'generation-rendering', 'expected_arcs': expected, 'actual_arcs': len(d['arcs'])})
        if not args.baseline:
            assert len(d['arcs']) == expected, report['cases'][-1]
    if args.baseline:
        page.screenshot(path=str(out/'original.png'), full_page=True)
    else:
        max_error = 0.0
        for mode, values in [('diff', [.6, .8, 2, 3, 6]), ('refl', [10, 35, 65])]:
            for value in values:
                for width, height in [(1440, 1000), (1024, 768), (820, 1180)]:
                    page.set_viewport_size({'width': width, 'height': height})
                    setup(mode, **{('a' if mode == 'diff' else 'alpha'): value})
                    assert page.evaluate(f'{H}.geometry().outgoing[0].radius') == 0
                    for dt in [.01, 6.24, .01, 15.74, 30, 70]:
                        before = page.evaluate(f'{H}.geometry().outgoing')
                        page.evaluate(f'{H}.advance({dt})')
                        d = drawing()
                        g = d['g']
                        expected = sum(len(e['circles']) if mode == 'refl' else len(g['sources']) for e in g['outgoing'])
                        assert len(d['arcs']) == expected
                        for e in g['outgoing']:
                            previous = next((x for x in before if x['index'] == e['index']), None)
                            if previous:
                                assert abs(e['radius'] - previous['radius'] - dt*.16*52) < 1e-8
                            if mode == 'refl':
                                for c, q in zip(e['circles'], e['points']):
                                    err = max(abs(math.hypot(q['x']-c['x'], q['y']-c['y'])-c['r']), abs(g['dr']['x']*q['x']+g['dr']['y']*q['y']-e['constant']))
                                    max_error = max(max_error, err)
                                    assert err < 1e-8
                                    assert any(abs(a['args'][0]-c['x']) < 1e-8 and abs(a['args'][1]-c['y']) < 1e-8 and abs(a['args'][2]-c['r']) < 1e-8 for a in d['arcs'])
                            else:
                                assert g['sources'][0]['y'] == g['top']
                                assert abs(g['sources'][-1]['y']-g['bottom']) < 1e-8
                                for edge in [g['top'], g['bottom']]:
                                    assert any(abs(a['args'][0]-g['bx']) < 1e-8 and abs(a['args'][1]-edge) < 1e-8 and abs(a['args'][2]-e['radius']) < 1e-8 for a in d['envelopes'])
                                for s in g['sources']:
                                    err = abs((g['bx']+e['radius']-s['x'])-e['radius'])
                                    max_error = max(max_error, err)
                                    assert err < 1e-8
                        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                    report['cases'].append({'mode': mode, 'value': value, 'viewport': [width, height], 'kind': 'geometry-and-rendering', 'passed': True})
        report['max_tangency_error_px'] = max_error
        # UI, not just setState: all steps, pause/start, slow, resets, mode switches.
        page.set_viewport_size({'width': 1440, 'height': 1000})
        for mode in ['diff', 'refl']:
            page.click('#'+mode+'Tab')
            page.click('#reset')
            for step in range(1, 5):
                assert page.evaluate(f'{H}.getState().step') == step
                if step == (3 if mode == 'diff' else 2):
                    assert page.evaluate(f'{H}.geometry().outgoing[0].radius') == 0
                    page.click('#play')
                    page.wait_for_timeout(350)
                    page.click('#play')
                    r = page.evaluate(f'{H}.geometry().outgoing[0].radius')
                    assert 0 < r < 8
                    page.wait_for_timeout(120)
                    assert page.evaluate(f'{H}.geometry().outgoing[0].radius') == r
                if step == 4:
                    before = page.evaluate(f'{H}.geometry().outgoing')
                    page.click('#slow')
                    assert page.evaluate(f'{H}.geometry().outgoing') == before
                    page.evaluate(f'{H}.advance(1)')
                    after = page.evaluate(f'{H}.geometry().outgoing')
                    assert abs(after[0]['radius']-before[0]['radius']-2.08) < 1e-8
                if step in ([3] if mode == 'diff' else [2, 3]):
                    before = page.evaluate(f'{H}.geometry().outgoing')
                    page.click('#next')
                    assert page.evaluate(f'{H}.geometry().outgoing') == before
                else:
                    page.click('#next')
            assert page.evaluate(f'{H}.getState().step') == 1
            assert page.evaluate(f'{H}.geometry().outgoing.length') == 0
            for value in ([.8, 3, 6] if mode == 'diff' else [10, 35, 65]):
                key = 'a' if mode == 'diff' else 'alpha'
                page.click(f'[data-{key}="{value:g}"]')
                assert page.evaluate(f'{H}.getState().{key}') == value
            selector = '#aRange' if mode == 'diff' else '#alphaRange'
            for value in (['0.6', '2', '6'] if mode == 'diff' else ['10', '42', '65']):
                page.locator(selector).fill(value)
                assert page.evaluate(f'{H}.getState().'+('a' if mode == 'diff' else 'alpha')) == float(value)
            page.click('#reset')
            assert page.evaluate(f'{H}.getState().time') == 0
            assert page.evaluate(f'{H}.getState().running') is False
            assert page.input_value(selector) == ('3' if mode == 'diff' else '35')
            report['cases'].append({'mode': mode, 'kind': 'UI-controls', 'passed': True})
        setup('diff')
        page.evaluate(f'{H}.advance(25)')
        page.click('#reflTab')
        assert page.evaluate(f'{H}.getState().diffEmissions') is None
        page.click('#diffTab')
        assert page.evaluate(f'{H}.getState().reflEmissions') is None
        # New generation starts exactly at zero, older ones stay put across boundary.
        for mode in ['diff', 'refl']:
            setup(mode)
            page.evaluate(f'{H}.advance(6.25)')
            radii = page.evaluate(f'{H}.geometry().outgoing.map(e=>e.radius)')
            assert radii == [52, 0], radii
            page.evaluate(f'{H}.advance(.01)')
            radii = page.evaluate(f'{H}.geometry().outgoing.map(e=>e.radius)')
            assert abs(radii[1]-.0832) < 1e-8 and radii[0] > 52
        for width, height in [(1440, 1000), (1024, 768), (820, 1180)]:
            page.set_viewport_size({'width': width, 'height': height})
            for mode in ['diff', 'refl']:
                setup(mode)
                page.evaluate(f'{H}.advance(22)')
                page.evaluate('scrollTo(0,0)')
                filename = f'{mode}-{width}x{height}.png'
                page.screenshot(path=str(out/filename), full_page=True)
                report['screenshots'].append(filename)
        # Touch events in an iPad-sized mobile context (not physical hardware).
        touch = browser.new_context(viewport={'width': 1024, 'height': 768}, is_mobile=True, has_touch=True, device_scale_factor=2)
        mobile = touch.new_page()
        mobile.on('pageerror', lambda e: report['errors'].append(str(e)))
        mobile.goto(args.url)
        mobile.locator('#reset').tap()
        mobile.locator('#next').tap()
        mobile.locator('#next').tap()
        assert mobile.evaluate(f'{H}.getState().step') == 3
        mobile.locator('#play').tap()
        mobile.wait_for_timeout(250)
        mobile.locator('#play').tap()
        assert mobile.evaluate(f'{H}.geometry().outgoing[0].radius') > 0
        mobile.locator('#reflTab').tap()
        mobile.locator('[data-alpha="65"]').tap()
        assert mobile.evaluate(f'{H}.getState().alpha') == 65
        targets = mobile.locator('button:visible,input:visible').evaluate_all('(els)=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))')
        assert all(t['w'] >= 44 and t['h'] >= 44 for t in targets)
        touch.close()
        report['cases'].append({'kind': 'touch-controls', 'passed': True})
        assert not report['errors'], report['errors']
    browser.close()
report['case_count'] = len(report['cases'])
(out/('baseline.json' if args.baseline else 'results.json')).write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
