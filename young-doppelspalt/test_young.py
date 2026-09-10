"""Run: python3 young-doppelspalt/test_young.py (Playwright Chromium).
Evidence defaults to /tmp/young-audit; no server or remote requests required.
"""
import argparse
import json
import math
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--out', default='/tmp/young-audit')
args = parser.parse_args()
out = Path(args.out)
out.mkdir(parents=True, exist_ok=True)
report = {'cases': [], 'screenshots': [], 'errors': [], 'external_requests': []}
H = 'window.__youngTest'
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.on('pageerror', lambda e: report['errors'].append(str(e)))
    page.on('request', lambda r: report['external_requests'].append(r.url) if r.url.startswith(('http:', 'https:')) else None)
    page.goto(Path(__file__).with_name('index.html').as_uri())
    page.wait_for_function(H)
    if page.locator('.student-intro-ok').is_visible():
        page.locator('.student-intro-ok').click()

    def evaluate(body):
        return page.evaluate('() => {const h=window.__youngTest;' + body + '}')

    def snap():
        return evaluate('return h.snapshot()')

    def screenshot(name):
        path = str(out / (name + '.png'))
        page.screenshot(path=path, full_page=True)
        report['screenshots'].append(path)

    def drawing(t):
        return page.evaluate('''t=>{
          const h=window.__youngTest,proto=CanvasRenderingContext2D.prototype,orig=proto.arc,arcs=[];
          proto.arc=function(...a){arcs.push({args:a,style:this.strokeStyle});return orig.apply(this,a)};
          let s;try{s=h.setEmissionTime(t)}finally{proto.arc=orig}
          return {s,arcs:arcs.filter(a=>a.args[3]===-Math.PI/2&&a.args[4]===Math.PI/2)};
        }''', t)

    max_error = 0
    for w, height in [(1440, 1000), (1024, 768), (820, 1180), (390, 844)]:
        page.set_viewport_size({'width': w, 'height': height})
        for d in [2, 4, 10]:
            for a in [.3, .5, 2]:
                evaluate('h.reset();h.setStage(2)')
                page.locator('#distance').fill(str(d))
                page.locator('#distance').dispatch_event('input')
                page.locator('#width').fill(str(a))
                page.locator('#width').dispatch_event('input')
                previous = None
                for t in [0, .01, 2.499, 2.5, 2.501, 7.5, 22, 60, 1000]:
                    drawn = drawing(t)
                    s, arcs = drawn['s'], drawn['arcs']
                    es = s['outgoing']['emissions']
                    g = s['geometry']
                    ys = [g['cy'] - g['sep']/2, g['cy'] + g['sep']/2]
                    max_r = max(math.hypot(g['screenX']-g['barrierX'], y-edge) for y in ys for edge in [14, g['h']-14])
                    expected = [i for i in range(math.floor(t/2.5)+1) if (t-i*2.5)*12 <= max_r+1e-7]
                    assert [e['index'] for e in es] == expected
                    assert len(arcs) == 4*len(es)
                    for e in es:
                        for y in ys:
                            matches = [arc for arc in arcs if abs(arc['args'][0]-g['barrierX']) < 1e-9 and abs(arc['args'][1]-y) < 1e-9 and abs(arc['args'][2]-e['radius']) < 1e-9]
                            assert len(matches) == 2  # gold underlay + cyan, each generation at each slit
                        if previous:
                            old = next((x for x in previous[1] if x['index'] == e['index']), None)
                            if old:
                                err = abs(e['radius']-old['radius']-12*(t-previous[0]))
                                max_error = max(max_error, err)
                                assert err < 1e-8
                    if t == 0:
                        assert [e['radius'] for e in es] == [0]
                    if t == 2.5:
                        assert [e['radius'] for e in es] == [30, 0]
                    previous = (t, es)
                assert evaluate('return document.documentElement.scrollWidth<=innerWidth')
                report['cases'].append({'kind': 'generations-and-real-canvas', 'viewport': [w, height], 'd': d, 'a': a, 'passed': True})
        evaluate('h.reset();h.setStage(3);h.setEmissionTime(22)')
        screenshot('wave-'+str(w))
    report['max_growth_error_px'] = max_error

    # All invariants below use the same clock function as requestAnimationFrame.
    page.set_viewport_size({'width': 1440, 'height': 1000})
    result = evaluate('''h.reset();h.state.running=true;h.advance(6.4);
      const birth=h.snapshot();h.advance(6.4);const end=h.snapshot();h.advance(10);const later=h.snapshot();
      h.state.running=false;return {birth,end,later};''')
    assert result['birth']['outgoing']['radii'] == [0]
    assert result['end']['running'] and result['later']['running']
    assert abs(result['later']['outgoing']['absoluteEmissionTime']-result['end']['outgoing']['absoluteEmissionTime']-10) < 1e-9
    assert result['later']['stage'] == 3
    report['cases'].append({'kind': 'automatic-sequence-and-continuous-final-stage', 'passed': True})

    # Native UI pause/resume: neither train drifts or resets at the final step.
    page.click('#reset')
    page.click('[data-stage="3"]')
    assert snap()['outgoing']['radii'] == [0]
    page.click('#play')
    page.wait_for_timeout(250)
    page.click('#play')
    before = snap()
    page.wait_for_timeout(350)
    after = snap()
    assert before['waveT'] == after['waveT']
    assert before['outgoing'] == after['outgoing']
    page.click('#play')
    page.wait_for_timeout(150)
    page.click('#play')
    resumed = snap()
    assert resumed['stage'] == 3
    assert resumed['outgoing']['absoluteEmissionTime'] > before['outgoing']['absoluteEmissionTime']
    report['cases'].append({'kind': 'real-ui-pause-resume', 'paused_time': before['outgoing']['absoluteEmissionTime'], 'resumed_time': resumed['outgoing']['absoluteEmissionTime'], 'passed': True})

    # Switching speed changes derivatives, not positions, of either train.
    evaluate('h.state.waveT=5;h.setEmissionTime(8);h.resumeEmission()')
    before = snap()
    page.click('#slow')
    after = snap()
    assert before['incoming'] == after['incoming'] and before['outgoing'] == after['outgoing']
    speed = evaluate('''const a=h.snapshot();h.state.running=true;h.advance(1);h.state.running=false;return {a,b:h.snapshot()}''')
    assert abs(speed['b']['waveT']-speed['a']['waveT']-.25) < 1e-9
    assert abs(speed['b']['outgoing']['radii'][0]-speed['a']['outgoing']['radii'][0]-3) < 1e-9
    page.click('#slow')
    assert snap()['incoming'] == speed['b']['incoming']
    report['cases'].append({'kind': 'speed-toggle-position-continuity-and-quarter-speed', 'passed': True})

    # Forward step, profile toggles, and model switches retain emitted rings.
    page.click('#reset')
    page.click('[data-stage="2"]')
    evaluate('h.setEmissionTime(22)')
    before = snap()['outgoing']
    page.click('[data-stage="3"]')
    page.check('#autoConstructive')
    page.check('#autoDestructive')
    assert snap()['outgoing'] == before
    screenshot('interference-loci')
    page.click('#photonTab')
    page.click('#emit')
    assert snap()['hits'] == 100
    page.check('#which')
    assert snap()['hits'] == 0
    assert evaluate('return Math.abs(h.intensity(.3)-h.envelope(.3))') < 1e-12
    screenshot('photon-which-way')
    page.click('#waveTab')
    assert snap()['outgoing'] == before
    assert evaluate('return h.intensity(0)') == 1
    values = evaluate('''return Array.from({length:101},(_,i)=>{const t=(i-50)/60;return {t,i:h.intensity(t),negative:h.intensity(-t),env:h.envelope(t)}})''')
    assert all(abs(v['i']-v['negative']) < 1e-12 and 0 <= v['i'] <= v['env']+1e-12 for v in values)
    assert evaluate('return h.intensity(Math.asin(.5/h.state.d))') < 1e-20
    page.click('#reset')
    assert snap()['stage'] == 0 and snap()['outgoing']['emissions'] == [] and snap()['waveT'] == 0
    page.click('[data-stage="2"]')
    assert snap()['outgoing']['radii'] == [0]
    screenshot('reset-zero-radius')
    report['cases'].append({'kind': 'steps-toggles-photons-profile-reset', 'passed': True})
    assert not report['errors'], report['errors']
    assert not report['external_requests'], report['external_requests']
    browser.close()
report['passed_case_count'] = len(report['cases'])
(out/'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
