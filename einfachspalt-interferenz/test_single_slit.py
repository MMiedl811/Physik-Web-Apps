"""Actual Chromium canvas + numerical regression; python3 einfachspalt-interferenz/test_single_slit.py.
Requires Playwright/Chromium. Writes evidence outside the repository.
"""
import argparse
import json
import math
from pathlib import Path
from typing import Any, Dict
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default=Path(__file__).with_name('index.html').as_uri())
parser.add_argument('--out', default='/tmp/einfachspalt-audit')
args = parser.parse_args()
out = Path(args.out)
out.mkdir(parents=True, exist_ok=True)
H = 'window.__singleSlitTest'
report: Dict[str, Any] = {'cases': [], 'screenshots': [], 'errors': [], 'external_requests': []}

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.on('pageerror', lambda e: report['errors'].append(str(e)))
    page.on('request', lambda r: report['external_requests'].append(r.url) if r.url.startswith('http') and not r.url.startswith('http://127.0.0.1:') else None)
    page.goto(args.url)
    page.get_by_role('button', name='Untersuchung starten').click()
    page.evaluate(f'{H}.setRunning(false)')

    def snap():
        return page.evaluate(f'{H}.snapshot()')

    def drawing():
        return page.evaluate('''() => {
          const h=window.__singleSlitTest, proto=CanvasRenderingContext2D.prototype;
          const original={arc:proto.arc,stroke:proto.stroke,moveTo:proto.moveTo,lineTo:proto.lineTo};
          const arcs=[], envelopes=[], incoming=[]; let points=[];
          proto.arc=function(...a){if(this.strokeStyle.startsWith('rgba(243, 184, 91'))arcs.push(a);return original.arc.apply(this,a)};
          for(const key of ['moveTo','lineTo'])proto[key]=function(...a){if(key==='moveTo')points=[];points.push(a);return original[key].apply(this,a)};
          proto.stroke=function(...a){if(this.strokeStyle==='#83e7dc')envelopes.push([...points]);if(this.strokeStyle==='#71d4ff')incoming.push([...points]);return original.stroke.apply(this,a)};
          try{h.draw()}finally{Object.assign(proto,original)}
          return {arcs,envelopes,incoming,s:h.snapshot()};
        }''')

    growth_error = 0
    for width, height in [(1440, 1000), (1024, 768), (820, 1180)]:
        page.set_viewport_size({'width': width, 'height': height})
        for ratio in [.6, .8, 2, 3, 6, 8]:
            page.evaluate(f'{H}.setStep(0); {H}.setAbsoluteTime(10); {H}.setSlitWidth({ratio}); {H}.setStep(3)')
            initial = snap()
            assert initial['radiiPx'] == [0], initial
            period = initial['emissionPeriodSec']
            previous = initial
            for elapsed in [.001, period-1e-6, period, period+1e-6, 10, 30, 60, 120]:
                page.evaluate(f'{H}.setAbsoluteTime({10+elapsed})')
                d = drawing()
                s = d['s']
                sources = max(3, min(7, math.floor(ratio+.5)+2))
                assert len(d['arcs']) == sources*len(s['emissions'])
                assert len(d['envelopes']) == len(s['emissions']) == s['envelopeCount']
                actual_radii = [a[2] for a in d['arcs'][::sources]]
                assert actual_radii == s['radiiPx']
                rect = page.locator('#scene').bounding_box()
                field_bottom = max(300, rect['height']*.68)
                field_height = field_bottom-12
                cy = 12+field_height/2
                gap = min(ratio*26, field_height-54)
                for points, radius in zip(d['envelopes'], s['radiiPx']):
                    for x, y in points:
                        dy = max(0, abs(y-cy)-gap/2)
                        assert abs((x-s['barrierX'])**2+dy**2-radius**2) < 1e-7
                indices = [e['index'] for e in s['emissions']]
                assert indices == list(range(indices[0], indices[-1]+1))
                assert indices[-1] == math.floor((elapsed+1e-9)/period)
                for e in s['emissions']:
                    old = next((x for x in previous['emissions'] if x['index']==e['index']), None)
                    if old:
                        err = abs(e['radiusPx']-old['radiusPx']-12*(s['absoluteTimeSec']-previous['absoluteTimeSec']))
                        growth_error = max(growth_error, err)
                        assert err < 1e-9
                if elapsed == period:
                    assert s['radiiPx'][-1] < 1e-9
                    assert abs(s['radiiPx'][-2]-26) < 1e-9
                    phase_error = (s['barrierX']-s['incomingFrontX']) % 26
                    assert min(phase_error,26-phase_error) < 1e-9
                # Every actual incoming stroke agrees with the shared emission phase.
                for points in d['incoming']:
                    assert abs((points[0][0]-s['incomingFrontX'])/26-round((points[0][0]-s['incomingFrontX'])/26)) < 1e-9
                previous = s
            report['cases'].append({'viewport':[width,height], 'ratio':ratio, 'samples':8, 'generations_at_120s':len(s['emissions'])})
            # Screenshot at a readable age, not the fully filled steady state.
            if ratio in [.8, 2, 6]:
                page.evaluate(f'{H}.setAbsoluteTime(20)')
                path = out/f'{width}x{height}-a{ratio}-result.png'
                page.screenshot(path=str(path), full_page=True)
                report['screenshots'].append(str(path))
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')

    # Actual lesson buttons: switching visible layers must preserve every generation.
    page.set_viewport_size({'width':1440,'height':1000})
    page.evaluate(f'{H}.setStep(0); {H}.setAbsoluteTime(10); {H}.setStep(3); {H}.setAbsoluteTime(20)')
    before = snap()['emissions']
    for step in [2, 4, 3, 2]:
        page.click(f'[data-step="{step}"]')
        assert snap()['emissions'] == before
        d = drawing()
        assert len(d['envelopes']) == (len(before) if step>=3 else 0)
    page.screenshot(path=str(out/'elementary-only.png'), full_page=True)
    report['screenshots'].append(str(out/'elementary-only.png'))
    page.click('[data-step="1"]')
    assert not drawing()['arcs']
    page.click('[data-step="2"]')
    assert snap()['radiiPx'] == [0]
    page.evaluate(f'{H}.setAbsoluteTime({snap()["absoluteTimeSec"]+5})')
    before = snap()['emissions']
    page.click('[data-ratio="0.8"]')
    assert snap()['emissions'] == before
    page.locator('#width').fill('6')
    assert snap()['slitWidthLambda'] == 6 and snap()['emissions'] == before
    page.set_viewport_size({'width':1024,'height':768})
    assert [(e['index'],e['radiusPx'],e['emitTimeSec']) for e in snap()['emissions']] == [(e['index'],e['radiusPx'],e['emitTimeSec']) for e in before]
    page.set_viewport_size({'width':1440,'height':1000})
    page.evaluate(f'{H}.restartEmission()')
    page.click('#slow')
    assert snap()['effectiveSpeedPxPerRealSecond'] == 3
    paused_time = snap()['absoluteTimeSec']
    page.evaluate(f'{H}.advanceBy(5)')
    assert snap()['absoluteTimeSec'] == paused_time
    page.evaluate(f'{H}.setRunning(true); {H}.advanceBy(4); {H}.setRunning(false)')
    assert snap()['radiiPx'] == [12]
    page.click('#slow')
    page.click('#play')
    t = snap()['absoluteTimeSec']
    page.wait_for_timeout(350)
    assert snap()['absoluteTimeSec'] > t
    page.screenshot(path=str(out/'running.png'), full_page=True)
    report['screenshots'].append(str(out/'running.png'))
    page.click('#play')
    t = snap()['absoluteTimeSec']
    page.wait_for_timeout(150)
    assert snap()['absoluteTimeSec'] == t
    page.click('#reset')
    page.evaluate(f'{H}.setRunning(false)')
    assert snap()['step'] == 0 and snap()['slitWidthLambda'] == 3
    assert snap()['envelopeCount'] == 0 and snap()['elementaryGenerationCount'] == 0
    page.click('[data-step="3"]')
    assert snap()['radiiPx'] == [0]
    # Midpoint phasor sum is an independent numerical reference for the existing sinc².
    physics = page.evaluate('''() => {
      const h=window.__singleSlitTest;let maxError=0,maxSymmetry=0;
      for(const a of [.6,.8,1,2,3,6,8]){
        h.setSlitWidth(a);if(h.intensity(0)!==1)throw Error('central maximum');
        if(a>=1&&h.intensity(Math.asin(1/a))>1e-25)throw Error('minimum');
        for(let k=-90;k<=90;k++){
          const t=k*Math.PI/180;let re=0,im=0;const n=2048;
          for(let j=0;j<n;j++){const phase=2*Math.PI*a*((j+.5)/n-.5)*Math.sin(t);re+=Math.cos(phase)/n;im+=Math.sin(phase)/n}
          maxError=Math.max(maxError,Math.abs(re*re+im*im-h.intensity(t)));
          maxSymmetry=Math.max(maxSymmetry,Math.abs(h.intensity(t)-h.intensity(-t)));
        }
      }return {maxError,maxSymmetry};
    }''')
    assert physics['maxError'] < 1e-6 and physics['maxSymmetry'] < 1e-12
    assert math.asin(1/6) < math.asin(1/2)
    assert not report['errors'] and not report['external_requests'], report
    report.update({'growth_max_error_px':growth_error,'physics':physics,'status':'PASS','render_samples':sum(c['samples'] for c in report['cases'])})
    (out/'results.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    browser.close()
