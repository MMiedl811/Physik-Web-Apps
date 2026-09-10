"""Sixth-step regression for both slit apps. python3 test_model_examples.py
Playwright Chromium; evidence in /tmp/slit-model-audit, no network/server needed.
"""
import json
import math
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent
OUT = Path('/tmp/slit-model-audit')
OUT.mkdir(exist_ok=True)
report: dict = {'cases': [], 'screenshots': [], 'errors': [], 'external_requests': []}
with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for app, hook, attr, canvas in [
        ('einfachspalt-interferenz', '__singleSlitTest', 'step', '#scene'),
        ('young-doppelspalt', '__youngTest', 'stage', '#screen'),
    ]:
        single = attr == 'step'
        for w, height in [(1440, 1000), (1024, 768), (820, 1180), (390, 844)]:
            page = browser.new_page(viewport={'width': w, 'height': height}, has_touch=True)
            page.on('pageerror', lambda e: report['errors'].append(str(e)))
            page.on('request', lambda r: report['external_requests'].append(r.url) if r.url.startswith(('http:', 'https:')) else None)
            page.goto((ROOT / app / 'index.html').as_uri())
            page.locator('.student-intro-ok').click()
            def ev(body):
                return page.evaluate('() => {const h=window.' + hook + ';' + body + '}')
            ev('h.setRunning(false)' if single else 'h.state.running=false;')
            page.click(f'[data-{attr}="4"]')
            if not single:
                page.click('[data-draw="constructive"]')
            cv = page.locator(canvas)
            cv.scroll_into_view_if_needed()
            r = cv.bounding_box()
            if single:
                s = ev('return h.snapshot()')
                x, y = s['barrierX'] + 90, 12 + (max(300, r['height'] * .68) - 12) / 2
            else:
                s = ev('return h.snapshot()')
                x, y = s['geometry']['barrierX'] + 40, s['geometry']['cy']
            def stroke():
                page.mouse.move(r['x'] + x, r['y'] + y)
                page.mouse.down()
                page.mouse.move(r['x'] + x + 40, r['y'] + y + 8, steps=8)
                page.mouse.up()
            stroke()
            # Real touch-input path at iPad sizes (not a synthetic DOM event).
            if w in (1024, 820):
                client = page.context.new_cdp_session(page)
                tx, ty = r['x'] + x + 15, r['y'] + y + 35
                client.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': tx, 'y': ty}]})
                client.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': tx + 30, 'y': ty + 4}]})
                client.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
                client.detach()
            own_expr = 'return h.getGuides()' if single else 'return h.snapshot().drawings'
            own = ev(own_expr)
            assert len(own) == (2 if w in (1024, 820) else 1), own
            if single:
                ev('h.setAbsoluteTime(h.getAbsoluteTime()+8)')
                waves = ev('return h.snapshot().emissions')
            else:
                ev('h.setEmissionTime(8)')
                waves = ev('return h.snapshot().outgoing.emissions')
            page.click(f'[data-{attr}="5"]')
            assert page.locator('#modelNote').is_visible()
            assert page.locator('#guideTools' if single else '#tools').is_hidden()
            assert ev('return h.snapshot().modelVisible')
            cv.scroll_into_view_if_needed()
            r = cv.bounding_box()
            stroke()  # Try dragging exactly where the stored learner line sits.
            assert ev(own_expr) == own
            assert ev('return h.snapshot().' + ('emissions' if single else 'outgoing.emissions')) == waves
            page.click(f'[data-{attr}="4"]')
            assert page.locator('#modelNote').is_hidden()
            assert ev(own_expr) == own
            page.click(f'[data-{attr}="5"]')
            if single:
                max_error = 0
                for a in [.6, .8, 1, 1.4, 1.5, 2, 3, 6, 8]:
                    ev(f'h.setSlitWidth({a})')
                    lines = ev('return h.modelGuides()')
                    assert sum(g['kind'] == 'destructive' for g in lines) == 2 * math.floor(a)
                    assert sum(g['theta'] == 0 for g in lines) == 1
                    for g in lines:
                        beta = math.pi * a * math.sin(g['theta'])
                        error = abs(math.sin(beta)) if g['kind'] == 'destructive' else abs(math.sin(beta) - beta * math.cos(beta))
                        max_error = max(max_error, error)
                        assert error < 1e-11
                        assert any(abs(other['theta'] + g['theta']) < 1e-12 and other['kind'] == g['kind'] for other in lines)
                    if a < 1:
                        assert len(lines) == 1
                    assert page.locator('#modelSummary').inner_text().startswith(f'Für a = {a:.1f} λ')
                ev('h.setSlitWidth(3)')
            else:
                max_error = 0
                for d in [2, 2.1, 4, 7.7, 10]:
                    page.locator('#distance').fill(str(d))
                    page.locator('#distance').dispatch_event('input')
                    s = ev('return h.snapshot()')
                    g = s['geometry']
                    lines = s['modelLines']
                    assert lines and any(line['q'] == 0 for line in lines)
                    for line in lines:
                        assert line['q'] < d
                        assert line['type'] == ('constructive' if line['q'] % 1 == 0 else 'destructive')
                        for point in line['points']:
                            dx, dy = point['x'] - g['barrierX'], point['y'] - g['cy']
                            delta = abs(math.hypot(dx, dy + g['sep']/2) - math.hypot(dx, dy - g['sep']/2))
                            max_error = max(max_error, abs(delta - line['q'] * 30))
                            assert abs(delta - line['q'] * 30) < 1e-9
                    page.locator('#width').fill('1.2')
                    page.locator('#width').dispatch_event('input')
                    assert ev('return h.snapshot().modelLines') == lines
                page.click('#photonTab')
                assert page.locator('#modelNote').is_hidden()
                page.click('#waveTab')
                assert page.locator('#modelNote').is_visible()
                page.click('#backToOwn')
                assert ev('return h.snapshot().stage') == 4
                page.click('[data-stage="5"]')
                page.locator('#distance').fill('4')
                page.locator('#distance').dispatch_event('input')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.locator(f'[data-{attr}="5"]').bounding_box()['height'] >= 44
            page.evaluate('window.scrollTo(0,0)')
            path = OUT / f'{app}-{w}-model.png'
            page.screenshot(path=str(path), full_page=True)
            report['screenshots'].append(str(path))
            page.click('#reset')
            ev('h.state.running=false')
            assert page.locator('#modelNote').is_hidden()
            report['cases'].append({'app': app, 'viewport': [w, height], 'max_geometry_error': max_error, 'status': 'PASS'})
            page.close()
    browser.close()
assert not report['errors'] and not report['external_requests'], report
report['passed_cases'] = len(report['cases'])
(OUT / 'report.json').write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
