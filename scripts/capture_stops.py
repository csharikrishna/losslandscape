from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(2500)
        
        # 1. Clean real hero view (clean UI)
        page.screenshot(path=r"c:\Users\cshar\Downloads\loss-landscape\public\real_hero_screenshot.png")
        page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_hero_screenshot.png")

        # Hide cards and controls
        page.evaluate("""
            const style = document.createElement('style');
            style.id = 'hide-ui-for-screenshot';
            style.innerHTML = '.panel-glass, header, nav, button, [aria-label*="audio"], [aria-label*="cursor"] { opacity: 0 !important; pointer-events: none !important; }';
            document.head.appendChild(style);
        """)
        
        # 2. Saddle View with trajectory
        saddle = page.locator('#saddle')
        if saddle.count() > 0:
            saddle.scroll_into_view_if_needed()
            page.wait_for_timeout(3000)
            page.screenshot(path=r"c:\Users\cshar\Downloads\loss-landscape\public\real_saddle_3d.png")
            page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_saddle_3d.png")

        # 3. Ridge View with trajectory
        ridge = page.locator('#ridge')
        if ridge.count() > 0:
            ridge.scroll_into_view_if_needed()
            page.wait_for_timeout(3000)
            page.screenshot(path=r"c:\Users\cshar\Downloads\loss-landscape\public\real_ridge_3d.png")
            page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_ridge_3d.png")

        # 4. Global Minimum View with full trajectory trail
        gmin = page.locator('#globalmin')
        if gmin.count() > 0:
            gmin.scroll_into_view_if_needed()
            page.wait_for_timeout(3000)
            page.screenshot(path=r"c:\Users\cshar\Downloads\loss-landscape\public\real_globalmin_3d.png")
            page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_globalmin_3d.png")

        # 5. Overlook View
        overlook = page.locator('#overlook')
        if overlook.count() > 0:
            overlook.scroll_into_view_if_needed()
            page.wait_for_timeout(3000)
            page.screenshot(path=r"c:\Users\cshar\Downloads\loss-landscape\public\real_overlook_3d.png")
            page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_overlook_3d.png")

        browser.close()
        print("All stop views saved!")

if __name__ == "__main__":
    main()
