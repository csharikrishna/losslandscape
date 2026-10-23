from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1200x630 with device_scale_factor=2 produces an ultra-crisp 2400x1260 retina image
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=2)
        
        # 1. Clean Real Hero
        page.goto("http://localhost:3000", wait_until="networkidle")
        page.wait_for_timeout(3500)
        page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_clean_hero_1200x630.png")
        
        # 2. Pure 3D Landscape at Saddle / Basin with glowing trajectory line
        page.evaluate("""
            const main = document.querySelector('main');
            const nav = document.querySelector('nav') || document.querySelector('header');
            const audio = document.querySelector('button[aria-label*="audio"]');
            if (main) main.style.display = 'none';
            if (nav) nav.style.display = 'none';
            if (audio) audio.style.display = 'none';
            window.scrollTo(0, 3000);
        """)
        page.wait_for_timeout(2500)
        page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_clean_landscape_saddle.png")
        
        # 3. Pure 3D Landscape at Ridge
        page.evaluate("window.scrollTo(0, 6500);")
        page.wait_for_timeout(2500)
        page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_clean_landscape_ridge.png")

        # 4. Pure 3D Landscape at Overlook / Finale
        page.evaluate("window.scrollTo(0, 9500);")
        page.wait_for_timeout(2500)
        page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_clean_landscape_overlook.png")

        # 5. Clean Explore Flight Mode
        page.goto("http://localhost:3000/?mode=explore", wait_until="networkidle")
        page.wait_for_timeout(3500)
        page.screenshot(path=r"C:\Users\cshar\.gemini\antigravity-ide\brain\4dbd91c9-60af-4390-8f7c-343acbbadb03\real_clean_explore.png")

        browser.close()
        print("All clean screenshots successfully saved!")

if __name__ == "__main__":
    main()
