class AccessibilityWidget {
    constructor() {
        this.settings = {};
        this.contentScale = 100; // Start at 100% (normal size)
        this.fontSize = 100;
        this.lineHeight = 100;
        this.letterSpacing = 100;
        this.textMagnifierHandlers = new Map(); // Store event handler references
        this.originalLineHeight = null; // Store original line-height
        console.log('Accessibility Widget: Initializing...');
        this.init();
    }

    init() {
        this.addFontAwesome();
        this.createWidget();
        this.loadSettings();
        
        // Delay binding events to ensure elements are created
        setTimeout(() => {
            this.bindEvents();
            this.applySettings();
            
            // Force initialize keyboard navigation
            console.log('Accessibility Widget: Force initializing keyboard navigation...');
            this.initKeyboardShortcuts();
            
            
            console.log('Accessibility Widget: Initialized successfully');
        }, 100);
    }

    bindEvents() {
        console.log('Accessibility Widget: Starting to bind events...');
        
        // Panel toggle functionality - using Shadow DOM
        const icon = this.shadowRoot.getElementById('accessibility-icon');
        const panel = this.shadowRoot.getElementById('accessibility-panel');
        const closeBtn = this.shadowRoot.getElementById('close-panel');
        
        console.log('Accessibility Widget: Found icon in Shadow DOM:', !!icon);
        console.log('Accessibility Widget: Found panel in Shadow DOM:', !!panel);
        console.log('Accessibility Widget: Found close button in Shadow DOM:', !!closeBtn);
        
        if (icon) {
            icon.addEventListener('click', () => {
                console.log('Accessibility Widget: Icon clicked, toggling panel');
                this.togglePanel();
                
                // Debug: Check panel state
                const panel = this.shadowRoot.getElementById('accessibility-panel');
                if (panel) {
                    console.log('Accessibility Widget: Panel found, current classes:', panel.className);
                    console.log('Accessibility Widget: Panel has active class:', panel.classList.contains('active'));
                    console.log('Accessibility Widget: Panel computed right position:', window.getComputedStyle(panel).right);
                } else {
                    console.error('Accessibility Widget: Panel not found after click!');
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Close button clicked');
                this.togglePanel();
            });
        }
        
        // Toggle switches - using Shadow DOM
        const toggles = this.shadowRoot.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const feature = e.target.id;
                const enabled = e.target.checked;
                console.log(`Accessibility Widget: Toggle ${feature} changed to ${enabled}`);
                this.handleToggle(feature, enabled);
                
                // Special handling for content scaling toggle
                if (feature === 'content-scaling') {
                    this.toggleContentScalingControls(enabled);
                }
                
                // Special handling for font sizing toggle
                if (feature === 'font-sizing') {
                    this.toggleFontSizingControls(enabled);
                }

                // Special handling for line height toggle
                if (feature === 'adjust-line-height') {
                    this.toggleLineHeightControls(enabled);
                }

                // Special handling for letter spacing toggle
                if (feature === 'adjust-letter-spacing') {
                    this.toggleLetterSpacingControls(enabled);
                }

            });
        });
        
        // Action buttons - using Shadow DOM
        const resetBtn = this.shadowRoot.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Reset settings clicked');
                this.resetSettings();
            });
        }
        
        const statementBtn = this.shadowRoot.getElementById('statement');
        if (statementBtn) {
            statementBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Statement button clicked');
                this.showStatement();
            });
        }
        
        const hideBtn = this.shadowRoot.getElementById('hide-interface');
        if (hideBtn) {
            hideBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Hide interface clicked');
                this.hideInterface();
            });
        }
        
        // Content scaling control buttons - using Shadow DOM
        const decreaseContentScaleBtn = this.shadowRoot.getElementById('decrease-content-scale-btn');
        if (decreaseContentScaleBtn) {
            decreaseContentScaleBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Decrease content scale clicked');
                this.decreaseContentScale();
            });
        }

        const increaseContentScaleBtn = this.shadowRoot.getElementById('increase-content-scale-btn');
        if (increaseContentScaleBtn) {
            increaseContentScaleBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Increase content scale clicked');
                this.increaseContentScale();
            });
        }

        // Font sizing control buttons - using Shadow DOM
        const decreaseFontSizeBtn = this.shadowRoot.getElementById('decrease-font-size-btn');
        if (decreaseFontSizeBtn) {
            decreaseFontSizeBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Decrease font size clicked');
                this.decreaseFontSize();
            });
        }

        const increaseFontSizeBtn = this.shadowRoot.getElementById('increase-font-size-btn');
        if (increaseFontSizeBtn) {
            increaseFontSizeBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Increase font size clicked');
                this.increaseFontSize();
            });
        }



        // Letter spacing control buttons - using Shadow DOM
        const decreaseLetterSpacingBtn = this.shadowRoot.getElementById('decrease-letter-spacing-btn');
        if (decreaseLetterSpacingBtn) {
            decreaseLetterSpacingBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Decrease letter spacing clicked');
                this.decreaseLetterSpacing();
            });
        }

        const increaseLetterSpacingBtn = this.shadowRoot.getElementById('increase-letter-spacing-btn');
        if (increaseLetterSpacingBtn) {
            increaseLetterSpacingBtn.addEventListener('click', () => {
                console.log('Accessibility Widget: Increase letter spacing clicked');
                this.increaseLetterSpacing();
            });
        }

        console.log('Accessibility Widget: Events bound successfully');
    }

    initTextMagnifier() {
        // Initialize text magnifier functionality
        console.log('Accessibility Widget: Text magnifier initialized');
    }

    initKeyboardShortcuts() {
        console.log('Accessibility Widget: Initializing keyboard shortcuts...');
        
        // Remove existing shortcuts if any
        this.removeKeyboardShortcuts();
        
        // Initialize element tracking for cycling
        this.currentElementIndex = {};
        this.highlightedElements = [];
        
        // Add keyboard shortcuts for navigation
        this.keyboardShortcutHandler = (e) => {
            console.log('Accessibility Widget: Key pressed:', e.key, 'Keyboard nav enabled:', this.settings['keyboard-nav']);
            
            // Only activate if keyboard navigation is enabled
            if (!this.settings['keyboard-nav']) {
                console.log('Accessibility Widget: Keyboard navigation not enabled');
                return;
            }
            
            // Check if user is typing in an input field
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.contentEditable === 'true')) {
                console.log('Accessibility Widget: Ignoring key press in input field');
                return; // Don't interfere with typing
            }
            
            // Single key navigation (no Alt/Ctrl needed)
            switch(e.key.toLowerCase()) {
                case 'm': // Menus
                    e.preventDefault();
                    console.log('Accessibility Widget: M key pressed - cycling through menus');
                    this.cycleThroughElements('nav, [role="navigation"], .menu, .navbar', 'menu');
                    break;
                case 'h': // Headings
                    e.preventDefault();
                    console.log('Accessibility Widget: H key pressed - cycling through headings');
                    this.cycleThroughElements('h1, h2, h3, h4, h5, h6', 'heading');
                    break;
                case 'f': // Forms
                    e.preventDefault();
                    console.log('Accessibility Widget: F key pressed - cycling through forms');
                    this.cycleThroughElements('form, input, textarea, select, button[type="submit"]', 'form');
                    break;
                case 'b': // Buttons
                    e.preventDefault();
                    console.log('Accessibility Widget: B key pressed - cycling through buttons');
                    this.cycleThroughElements('button, .btn, input[type="button"], input[type="submit"]', 'button');
                    break;
                case 'g': // Graphics
                    e.preventDefault();
                    console.log('Accessibility Widget: G key pressed - cycling through graphics');
                    this.cycleThroughElements('img, svg, canvas, .image, .graphic', 'graphic');
                    break;
                case 'l': // Links
                    e.preventDefault();
                    console.log('Accessibility Widget: L key pressed - cycling through links');
                    this.cycleThroughElements('a[href], .link', 'link');
                    break;
                case 's': // Skip to main content
                    e.preventDefault();
                    console.log('Accessibility Widget: S key pressed - skipping to main content');
                    this.focusElement('main, [role="main"], .main-content, #main');
                    break;
                default:
                    // For any other key, just log it to see if the event listener is working
                    console.log('Accessibility Widget: Other key pressed:', e.key);
                    break;
            }
        };
        
        // Add event listener
        document.addEventListener('keydown', this.keyboardShortcutHandler);
        console.log('Accessibility Widget: Keyboard shortcuts initialized successfully');
        
        // Test if event listener is working
        setTimeout(() => {
            console.log('Accessibility Widget: Testing keyboard event listener...');
            // Simulate a key press to test
            const testEvent = new KeyboardEvent('keydown', { key: 'h' });
            document.dispatchEvent(testEvent);
        }, 1000);
    }

    removeKeyboardShortcuts() {
        if (this.keyboardShortcutHandler) {
            document.removeEventListener('keydown', this.keyboardShortcutHandler);
            this.keyboardShortcutHandler = null;
            console.log('Accessibility Widget: Keyboard shortcuts removed');
        }
        
        // Remove all highlighted elements
        this.removeAllHighlights();
        
        // Reset element tracking
        this.currentElementIndex = {};
    }

    cycleThroughElements(selector, type) {
        console.log(`Accessibility Widget: Cycling through ${type} elements with selector: ${selector}`);
        
        // Remove previous highlights
        this.removeAllHighlights();
        
        // Get all matching elements
        const elements = Array.from(document.querySelectorAll(selector));
        console.log(`Accessibility Widget: Found ${elements.length} ${type} elements`);
        
        if (elements.length === 0) {
            console.log(`Accessibility Widget: No ${type} elements found`);
            return;
        }
        
        // Get current index for this type
        const currentIndex = this.currentElementIndex[type] || 0;
        const element = elements[currentIndex];
        
        console.log(`Accessibility Widget: Highlighting ${type} element ${currentIndex + 1} of ${elements.length}:`, element);
        
        // Create highlight
        this.createHighlight(element, type, currentIndex + 1, elements.length);
        
        // Update index for next cycle
        this.currentElementIndex[type] = (currentIndex + 1) % elements.length;
        
        console.log(`Accessibility Widget: Highlighted ${type} ${currentIndex + 1} of ${elements.length}`);
    }

    createHighlight(element, type, current, total) {
        console.log(`Accessibility Widget: Creating highlight for ${type} element:`, element);
        
        const rect = element.getBoundingClientRect();
        console.log(`Accessibility Widget: Element rect:`, rect);
        
        // Create highlight box
        const highlight = document.createElement('div');
        highlight.className = 'keyboard-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: ${rect.top - 3}px;
            left: ${rect.left - 3}px;
            width: ${rect.width + 6}px;
            height: ${rect.height + 6}px;
            border: 3px solid #6366f1;
            border-radius: 6px;
            background: transparent;
            pointer-events: none;
            z-index: 1000000;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
            transition: all 0.3s ease;
        `;
        
        // Create label
        const label = document.createElement('div');
        label.className = 'keyboard-highlight-label';
        label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ${current} of ${total}`;
        label.style.cssText = `
            position: fixed;
            top: ${rect.top - 35}px;
            left: ${rect.left}px;
            background: #6366f1;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            z-index: 1000001;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        // Add to page
        document.body.appendChild(highlight);
        document.body.appendChild(label);
        
        console.log(`Accessibility Widget: Added highlight and label to page`);
        
        // Store references for removal
        this.highlightedElements.push(highlight, label);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            this.removeAllHighlights();
        }, 3000);
    }

    removeAllHighlights() {
        if (this.highlightedElements && Array.isArray(this.highlightedElements)) {
        this.highlightedElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        }
        this.highlightedElements = [];
    }

    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            console.log(`Accessibility Widget: Focused on ${selector}`);
        } else {
            console.log(`Accessibility Widget: Element not found: ${selector}`);
        }
    }

    addFontAwesome() {
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
            console.log('Accessibility Widget: Font Awesome added');
        }
    }

    createWidget() {
        // Create widget container that will host the Shadow DOM
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'accessibility-widget-container';
        widgetContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 99999;
        `;
        // Append to documentElement instead of body to avoid transform issues
        document.documentElement.appendChild(widgetContainer);

        // Create Shadow DOM
        const shadowRoot = widgetContainer.attachShadow({ mode: 'open' });
        this.shadowRoot = shadowRoot;

        // Add CSS to Shadow DOM
        const style = document.createElement('style');
        style.textContent = this.getWidgetCSS();
        shadowRoot.appendChild(style);

        // Create accessibility icon inside Shadow DOM
        const icon = document.createElement('div');
        icon.id = 'accessibility-icon';
        icon.className = 'accessibility-icon';
        icon.innerHTML = '<i class="fas fa-universal-access"></i>';
        icon.style.pointerEvents = 'auto';
        shadowRoot.appendChild(icon);
        console.log('Accessibility Widget: Icon created in Shadow DOM with ID:', icon.id);

        // Create panel inside Shadow DOM
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.innerHTML = this.getPanelHTML();
        panel.style.pointerEvents = 'auto';
        shadowRoot.appendChild(panel);
        console.log('Accessibility Widget: Panel created in Shadow DOM with ID:', panel.id);

        
        // Verify elements are in Shadow DOM
        setTimeout(() => {
            const iconCheck = shadowRoot.getElementById('accessibility-icon');
            const panelCheck = shadowRoot.getElementById('accessibility-panel');
            console.log('Accessibility Widget: Icon in Shadow DOM:', !!iconCheck);
            console.log('Accessibility Widget: Panel in Shadow DOM:', !!panelCheck);
            
            // Debug: Check panel visibility
            if (panelCheck) {
                const computedStyle = window.getComputedStyle(panelCheck);
                console.log('Accessibility Widget: Panel computed styles:');
                console.log('- display:', computedStyle.display);
                console.log('- visibility:', computedStyle.visibility);
                console.log('- opacity:', computedStyle.opacity);
                console.log('- right:', computedStyle.right);
                console.log('- z-index:', computedStyle.zIndex);
            }
        }, 100);
    }

    getWidgetCSS() {
        return `
            /* Accessibility Widget Styles - Shadow DOM */
            :host {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 99999;
                isolation: isolate;
                contain: layout style paint;
            }

            /* Ensure icon positioning is always fixed and not affected by host context */
            .accessibility-icon {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                top: auto !important;
                left: auto !important;
                transform: none !important;
                z-index: 99999 !important;
            }

            /* Accessibility Icon - Visual styling */
            .accessibility-icon {
                width: 60px;
                height: 60px;
                background: #6366f1;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                pointer-events: auto;
            }

            .accessibility-icon:hover {
                transform: scale(1.1);
                background: #4f46e5;
            }

            .accessibility-icon i {
                color: #ffffff;
                font-size: 24px;
            }

            /* Accessibility Panel - Fixed position on right side */
            .accessibility-panel {
                position: fixed !important;
                top: 20px !important;
                right: -500px !important;
                width: 400px;
                height: calc(100vh - 40px);
                background: #ffffff !important;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
                z-index: 100000 !important;
                transition: right 0.3s ease;
                overflow-y: auto;
                overflow-x: hidden;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                border-radius: 12px;
                margin: 0 20px;
                pointer-events: auto;
            }

            .accessibility-panel.active {
                right: 20px !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .accessibility-icon {
                    width: 50px !important;
                    height: 50px !important;
                    bottom: 15px !important;
                    right: 15px !important;
                }
                
                .accessibility-icon i {
                    font-size: 20px !important;
                }
                
                .accessibility-panel {
                    width: calc(100vw - 40px) !important;
                    right: -100vw !important;
                    margin: 0 20px !important;
                    height: calc(100vh - 40px) !important;
                }
                
                .accessibility-panel.active {
                    right: 20px !important;
                }
            }
            
            @media (max-width: 480px) {
                .accessibility-icon {
                    width: 45px !important;
                    height: 45px !important;
                    bottom: 10px !important;
                    right: 10px !important;
                }
                
                .accessibility-icon i {
                    font-size: 18px !important;
                }
                
                .accessibility-panel {
                    width: calc(100vw - 20px) !important;
                    margin: 0 10px !important;
                    height: calc(100vh - 20px) !important;
                }
                
                .accessibility-panel.active {
                    right: 10px !important;
                }
            }

            /* Panel Header */
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #ffffff;
                border-radius: 12px 12px 0 0;
                position: sticky;
                top: 0;
                z-index: 1001;
            }

            .close-btn {
                cursor: pointer;
                font-size: 20px;
                padding: 5px;
                transition: transform 0.2s ease;
            }

            .close-btn:hover {
                transform: scale(1.1);
            }

            .language-selector {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }

            /* Panel Content */
            .accessibility-panel h2 {
                text-align: center;
                margin: 20px 0;
                color: #334155;
                font-size: 24px;
                font-weight: 600;
            }

            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 0 20px;
                margin-bottom: 20px;
            }

            .action-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px 16px;
                background: #ffffff;
                border: 2px solid #6366f1;
                color: #6366f1;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .action-btn:hover {
                background: #6366f1;
                color: #ffffff;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
            }

            /* Profiles Section */
            .profiles-section {
                padding: 0 20px 20px;
            }

            .profiles-section h3 {
                color: #334155;
                margin-bottom: 20px;
                font-size: 18px;
                font-weight: 600;
            }

            .profile-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #f1f5f9;
                border-radius: 8px;
                margin-bottom: 10px;
                transition: all 0.3s ease;
                border: 1px solid #e2e8f0;
                min-height: 60px;
            }

            .profile-item:hover {
                background: #f8fafc;
                border-color: #6366f1;
                transform: translateX(2px);
            }

            .profile-info {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
                min-width: 0;
            }

            .profile-info i {
                font-size: 20px;
                color: #6366f1;
                width: 24px;
                flex-shrink: 0;
            }

            .profile-info h4 {
                margin: 0;
                font-size: 16px;
                color: #334155;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .profile-info p {
                margin: 5px 0 0 !important;
                font-size: 14px;
                color: #64748b;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .profile-info small {
                display: block;
                margin: 3px 0 0;
                font-size: 12px;
                color: #6366f1;
                font-style: italic;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
                flex-shrink: 0;
            }

            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: 0.3s;
                border-radius: 24px;
            }

            .slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 3px;
                bottom: 3px;
                background-color: #ffffff;
                transition: 0.3s;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            input:checked + .slider {
                background-color: #6366f1 !important;
            }

            input:checked + .slider:before {
                transform: translateX(26px) !important;
            }

            /* Panel Footer */
            .panel-footer {
                position: sticky;
                bottom: 0;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #ffffff;
                padding: 15px 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 14px;
                border-radius: 0 0 12px 12px;
                z-index: 1001;
            }

            .panel-footer .learn-more {
                color: #ffffff;
                text-decoration: none;
                font-weight: 600;
            }

            /* Global Accessibility Feature Classes - These will sync with main page */
            :host(.seizure-safe) .accessibility-icon,
            :host(.seizure-safe) .accessibility-panel {
                filter: grayscale(0.8) contrast(0.9) !important;
            }
            
            /* Ensure seizure safe icon stays in correct position */
            :host(.seizure-safe) .accessibility-icon {
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                z-index: 99999 !important;
            }

            /* Vision Impaired - Responsive scaling approach */
            :host(.vision-impaired) {
                filter: saturate(1.1) brightness(1.05) !important;
                /* Use CSS custom properties for responsive scaling */
                --vision-scale: 1.2;
                --vision-font-scale: 1.15;
            }

            /* Scale icon and panel with responsive units */
            :host(.vision-impaired) .accessibility-icon {
                width: calc(60px * var(--vision-scale)) !important;
                height: calc(60px * var(--vision-scale)) !important;
                font-size: calc(24px * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel {
                width: calc(400px * var(--vision-scale)) !important;
                font-size: calc(1em * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel h2 {
                font-size: calc(24px * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel h3 {
                font-size: calc(18px * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel h4 {
                font-size: calc(16px * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel p {
                font-size: calc(14px * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel .action-btn {
                font-size: calc(1em * var(--vision-font-scale)) !important;
                padding: calc(12px * var(--vision-font-scale)) calc(16px * var(--vision-font-scale)) !important;
            }

            :host(.vision-impaired) .accessibility-panel * {
                font-size: 1em !important;
            }

            :host(.vision-impaired) .accessibility-panel h1 {
                font-size: 1.5em !important;
            }

            :host(.vision-impaired) .accessibility-panel h2 {
                font-size: 1.3em !important;
            }

            :host(.vision-impaired) .accessibility-panel h3 {
                font-size: 1.2em !important;
            }

            :host(.vision-impaired) .accessibility-panel h4 {
                font-size: 1.1em !important;
            }

            :host(.adhd-friendly) .accessibility-icon,
            :host(.adhd-friendly) .accessibility-panel {
                filter: saturate(0.9) brightness(0.9) !important;
            }

            :host(.cognitive-disability) .accessibility-icon,
            :host(.cognitive-disability) .accessibility-panel {
                filter: saturate(1.2) brightness(1.1) !important;
            }



            :host(.monochrome) .accessibility-icon,
            :host(.monochrome) .accessibility-panel {
                filter: grayscale(1) !important;
            }

            :host(.dark-contrast) .accessibility-icon,
            :host(.dark-contrast) .accessibility-panel {
                filter: saturate(1.2) brightness(0.8) contrast(1.3) !important;
            }

            :host(.light-contrast) .accessibility-icon,
            :host(.light-contrast) .accessibility-panel {
                filter: saturate(1.2) brightness(1.2) contrast(0.9) !important;
            }

            /* Reduce high contrast intensity for Shadow DOM content */
            :host(.high-contrast) .accessibility-icon,
            :host(.high-contrast) .accessibility-panel,
            :host(.high-contrast) .accessibility-panel * {
                filter: contrast(0.8) !important;
                -webkit-filter: contrast(0.8) !important;
            }


            /* Default font styles for widget elements (when readable font is disabled) */
            :host(:not(.readable-font)) .accessibility-icon,
            :host(:not(.readable-font)) .accessibility-panel {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-weight: normal !important;
                letter-spacing: normal !important;
            }

            :host(:not(.readable-font)) .accessibility-panel h2,
            :host(:not(.readable-font)) .accessibility-panel h3,
            :host(:not(.readable-font)) .accessibility-panel h4,
            :host(:not(.readable-font)) .accessibility-panel p,
            :host(:not(.readable-font)) .accessibility-panel .action-btn,
            :host(:not(.readable-font)) .accessibility-panel button,
            :host(:not(.readable-font)) .accessibility-panel input,
            :host(:not(.readable-font)) .accessibility-panel label {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                font-weight: normal !important;
                letter-spacing: normal !important;
            }

            /* Readable Font - Apply to widget elements (must come after default rules) */
            :host(.readable-font) .accessibility-icon,
            :host(.readable-font) .accessibility-panel {
                font-family: 'Arial', 'Open Sans', sans-serif !important;
                font-weight: 500 !important;
                letter-spacing: 0.5px !important;
            }

            :host(.readable-font) .accessibility-panel h2,
            :host(.readable-font) .accessibility-panel h3,
            :host(.readable-font) .accessibility-panel h4,
            :host(.readable-font) .accessibility-panel p,
            :host(.readable-font) .accessibility-panel .action-btn,
            :host(.readable-font) .accessibility-panel button,
            :host(.readable-font) .accessibility-panel input,
            :host(.readable-font) .accessibility-panel label {
                font-family: 'Arial', 'Open Sans', sans-serif !important;
                font-weight: 500 !important;
                letter-spacing: 0.5px !important;
            }

            :host(.high-saturation) .accessibility-icon,
            :host(.high-saturation) .accessibility-panel {
                filter: saturate(1.5) !important;
            }

            /* Font Awesome Icons */
            .fas {
                font-family: 'Font Awesome 5 Free';
                font-weight: 900;
            }



            .fa-universal-access:before {
                content: "\\f29a";
            }

            .fa-times:before {
                content: "\\f00d";
            }

            .fa-flag:before {
                content: "\\f024";
            }

            .fa-redo:before {
                content: "\\f01e";
            }

            .fa-file-alt:before {
                content: "\\f15c";
            }

            .fa-eye-slash:before {
                content: "\\f070";
            }

            .fa-bolt:before {
                content: "\\f0e7";
            }

            .fa-eye:before {
                content: "\\f06e";
            }

            .fa-brain:before {
                content: "\\f5dc";
            }

            .fa-keyboard:before {
                content: "\\f11c";
            }

            .fa-user:before {
                content: "\\f007";
            }

            .fa-search-plus:before {
                content: "\\f00e";
            }

            .fa-font:before {
                content: "\\f031";
            }

            .fa-heading:before {
                content: "\\f1dc";
            }

            .fa-link:before {
                content: "\\f0c1";
            }

            .fa-search:before {
                content: "\\f002";
            }

            .fa-align-center:before {
                content: "\\f037";
            }

            .fa-arrows-alt-v:before {
                content: "\\f07d";
            }

            .fa-text-width:before {
                content: "\\f035";
            }

            .fa-palette:before {
                content: "\\f53f";
            }

            .fa-volume-mute:before {
                content: "\\f6a9";
            }

            .fa-image:before {
                content: "\\f03e";
            }

            .fa-book-open:before {
                content: "\\f518";
            }

            .fa-compass:before {
                content: "\\f14e";
            }

            .fa-list:before {
                content: "\\f03a";
            }

            .fa-play:before {
                content: "\\f04b";
            }

            .fa-mask:before {
                content: "\\f6fa";
            }

            .fa-mouse-pointer:before {
                content: "\\f245";
            }

            /* Color Picker Inline */
            .color-picker-inline {
                margin: 8px 0;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
                width: 100%;
                box-sizing: border-box;
            }

            .color-picker-content {
                text-align: center;
            }

            .color-picker-content h4 {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 14px;
                font-weight: 600;
            }

            .color-options {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-bottom: 12px;
                flex-wrap: wrap;
            }

            .color-option {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.2s ease;
                position: relative;
                flex-shrink: 0;
            }

            .color-option:hover {
                transform: scale(1.1);
                border-color: #6366f1;
            }

            .color-option.selected {
                border-color: #6366f1;
                box-shadow: 0 0 0 1px #fff, 0 0 0 3px #6366f1;
            }

            .cancel-btn {
                background: #6b7280;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: background-color 0.2s ease;
            }

            .cancel-btn:hover {
                background: #4b5563;
            }
        `;
    }

    getPanelHTML() {
        return `
            <div class="panel-header">
                <div class="close-btn" id="close-panel">
                    <i class="fas fa-times"></i>
                </div>
                <div class="language-selector">
                    <span>ENGLISH</span>
                    <i class="fas fa-flag"></i>
                </div>
            </div>
            
            <h2>Accessibility Adjustments</h2>
            
            <div class="action-buttons">
                <button id="reset-settings" class="action-btn">
                    <i class="fas fa-redo"></i>
                    Reset Settings
                </button>
                <button id="statement" class="action-btn">
                    <i class="fas fa-file-alt"></i>
                    Statement
                </button>
                <button id="hide-interface" class="action-btn">
                    <i class="fas fa-eye-slash"></i>
                    Hide Interface
                </button>
            </div>

            <div class="profiles-section">
                <h3>Choose the right accessibility profile for you</h3>
                
                <!-- Module 1: Seizure Safe Profile -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-bolt"></i>
                        <div>
                            <h4>Seizure Safe Profile</h4>
                            <p>Clear flashes & reduces color</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="seizure-safe">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 2: Vision Impaired Profile -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-eye"></i>
                        <div>
                            <h4>Vision Impaired Profile</h4>
                            <p>Enhances website's visuals</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="vision-impaired">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 3: ADHD Friendly Profile -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-layer-group"></i>
                        <div>
                            <h4>ADHD Friendly Profile</h4>
                            <p>More focus & fewer distractions</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="adhd-friendly">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 4: Cognitive Disability Profile -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-bullseye"></i>
                        <div>
                            <h4>Cognitive Disability Profile</h4>
                            <p>Assists with reading & focusing</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="cognitive-disability">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 5: Keyboard Navigation -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-arrow-right"></i>
                        <div>
                            <h4>Keyboard Navigation (Motor)</h4>
                            <p>Use website with the keyboard</p>
                            <div class="profile-description">
                                <p>This profile enables motor-impaired persons to operate the website using keyboard keys (Tab, Shift+Tab, Enter) and shortcuts (e.g., "M" for menus, "H" for headings, "F" for forms, "B" for buttons, "G" for graphics).</p>
                                <p><strong>Note:</strong> This profile prompts automatically for keyboard users.</p>
                            </div>
                            <small style="color: #6366f1; font-style: italic;">Activates with Screen Reader</small>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="keyboard-nav" checked>
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 6: Blind Users Screen Reader -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-headphones"></i>
                        <div>
                            <h4>Blind Users (Screen Reader)</h4>
                            <p>Optimize website for screen-readers</p>
                            <div class="profile-description">
                                <p>This profile adjusts the website to be compatible with screen-readers such as JAWS, NVDA, VoiceOver, and TalkBack. Screen-reader software is installed on the blind user's computer and smartphone, and websites should ensure compatibility.</p>
                                <p><strong>Note:</strong> This profile prompts automatically to screen-readers.</p>
                            </div>
                            <small style="color: #6366f1; font-style: italic;">Activates with Keyboard Navigation</small>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="screen-reader">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 7: Content Scaling -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-expand-arrows-alt"></i>
                        <div>
                            <h4>Content Scaling</h4>
                            <p>Scale content with arrow controls</p>
                            <div class="scaling-controls" id="content-scaling-controls" style="display: none; margin-top: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button class="scaling-btn" id="decrease-content-scale-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-down"></i> -5%
                                    </button>
                                    <span id="content-scale-value" style="font-weight: bold; min-width: 60px; text-align: center;">100%</span>
                                    <button class="scaling-btn" id="increase-content-scale-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-up"></i> +5%
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="content-scaling">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 8: Readable Font -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-font"></i>
                        <div>
                            <h4>Readable Font</h4>
                            <p>High-legibility fonts</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="readable-font">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 9: Highlight Titles -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-heading"></i>
                        <div>
                            <h4>Highlight Titles</h4>
                            <p>Add boxes around headings</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="highlight-titles">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 10: Highlight Links -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-link"></i>
                        <div>
                            <h4>Highlight Links</h4>
                            <p>Add boxes around links</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="highlight-links">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 11: Text Magnifier -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-search-plus"></i>
                        <div>
                            <h4>Text Magnifier</h4>
                            <p>Floating magnifying glass tool</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="text-magnifier">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 12: Adjust Font Sizing -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-text-height"></i>
                        <div>
                            <h4>Adjust Font Sizing</h4>
                            <p>Font size with arrow controls</p>
                            <div class="scaling-controls" id="font-sizing-controls" style="display: none; margin-top: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button class="scaling-btn" id="decrease-font-size-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-down"></i> -10%
                                    </button>
                                    <span id="font-size-value" style="font-weight: bold; min-width: 60px; text-align: center;">100%</span>
                                    <button class="scaling-btn" id="increase-font-size-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-up"></i> +10%
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="font-sizing">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 13: Align Center -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-align-center"></i>
                        <div>
                            <h4>Align Center</h4>
                            <p>Center-aligns all text content</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="align-center">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 15: Adjust Line Height -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-arrows-alt-v"></i>
                        <div>
                            <h4>Adjust Line Height</h4>
                            <p>Line height with arrow controls</p>
                            <div class="scaling-controls" id="line-height-controls" style="display: none; margin-top: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button class="scaling-btn" id="decrease-line-height-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-down"></i> -10%
                                    </button>
                                    <span id="line-height-value" style="font-weight: bold; min-width: 60px; text-align: center;">100%</span>
                                    <button class="scaling-btn" id="increase-line-height-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-up"></i> +10%
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="adjust-line-height">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 16: Adjust Letter Spacing -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-text-width"></i>
                        <div>
                            <h4>Adjust Letter Spacing</h4>
                            <p>Letter spacing with arrow controls</p>
                            <div class="scaling-controls" id="letter-spacing-controls" style="display: none; margin-top: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <button class="scaling-btn" id="decrease-letter-spacing-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-down"></i> -10%
                                    </button>
                                    <span id="letter-spacing-value" style="font-weight: bold; min-width: 60px; text-align: center;">100%</span>
                                    <button class="scaling-btn" id="increase-letter-spacing-btn" style="background: #6366f1; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-chevron-up"></i> +10%
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="adjust-letter-spacing">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 17: Align Left -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-align-left"></i>
                        <div>
                            <h4>Align Left</h4>
                            <p>Left-aligns text content</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="align-left">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 18: Align Right -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-align-right"></i>
                        <div>
                            <h4>Align Right</h4>
                            <p>Right-aligns text content</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="align-right">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 19: Dark Contrast -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-moon"></i>
                        <div>
                            <h4>Dark Contrast</h4>
                            <p>Dark background with light text</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="dark-contrast">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 20: Light Contrast -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-sun"></i>
                        <div>
                            <h4>Light Contrast</h4>
                            <p>Light background with dark text</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="light-contrast">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 20: High Contrast -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-adjust"></i>
                        <div>
                            <h4>High Contrast</h4>
                            <p>Maximum contrast implementation</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="high-contrast">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 21: High Saturation -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-palette"></i>
                        <div>
                            <h4>High Saturation</h4>
                            <p>Increases color intensity</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="high-saturation">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 22: Adjust Text Colors -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-paint-brush"></i>
                        <div>
                            <h4>Adjust Text Colors</h4>
                            <p>Color picker functionality</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="adjust-text-colors">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 23: Monochrome -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-circle"></i>
                        <div>
                            <h4>Monochrome</h4>
                            <p>Removes all colors except black, white, grays</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="monochrome">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 24: Adjust Title Colors -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-heading"></i>
                        <div>
                            <h4>Adjust Title Colors</h4>
                            <p>Color customization for headings</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="adjust-title-colors">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 25: Low Saturation -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-tint"></i>
                        <div>
                            <h4>Low Saturation</h4>
                            <p>Reduces color intensity</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="low-saturation">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 26: Adjust Background Colors -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-fill-drip"></i>
                        <div>
                            <h4>Adjust Background Colors</h4>
                            <p>Background color customization</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="adjust-bg-colors">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 27: Mute Sound -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-volume-mute"></i>
                        <div>
                            <h4>Mute Sound</h4>
                            <p>Disables all audio content</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="mute-sound">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 28: Hide Images -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-image"></i>
                        <div>
                            <h4>Hide Images</h4>
                            <p>Toggle to hide all images</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="hide-images">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 29: Read Mode -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-book-open"></i>
                        <div>
                            <h4>Read Mode</h4>
                            <p>Removes navigation elements</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="read-mode">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 30: Reading Guide -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-highlighter"></i>
                        <div>
                            <h4>Reading Guide</h4>
                            <p>Movable highlight bar</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="reading-guide">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 31: Useful Links -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-external-link-alt"></i>
                        <div>
                            <h4>Useful Links</h4>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="useful-links">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 32: Stop Animation -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-pause"></i>
                        <div>
                            <h4>Stop Animation</h4>
                            <p>Pauses all CSS animations</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="stop-animation">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 33: Reading Mask -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-mask"></i>
                        <div>
                            <h4>Reading Mask</h4>
                            <p>Semi-transparent overlay</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="reading-mask">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 34: Highlight Hover -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-mouse-pointer"></i>
                        <div>
                            <h4>Highlight Hover</h4>
                            <p>Visual feedback on hover</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="highlight-hover">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 35: Highlight Focus -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-crosshairs"></i>
                        <div>
                            <h4>Highlight Focus</h4>
                            <p>Prominent focus indicators</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="highlight-focus">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 36: Big Black Cursor -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-mouse"></i>
                        <div>
                            <h4>Big Black Cursor</h4>
                            <p>Increases cursor size</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="big-black-cursor">
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Module 37: Big White Cursor -->
                <div class="profile-item">
                    <div class="profile-info">
                        <i class="fas fa-mouse"></i>
                        <div>
                            <h4>Big White Cursor</h4>
                            <p>Increases cursor size</p>
                        </div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="big-white-cursor">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="panel-footer">
                <div>
                    <i class="fas fa-check"></i>
                    Accessibility Features
                </div>
            </div>
        `;
    }



    togglePanel() {
        console.log('Accessibility Widget: Toggling panel...');
        const panel = this.shadowRoot.getElementById('accessibility-panel');
        
        if (panel) {
            console.log('Accessibility Widget: Panel found, current classes:', panel.className);
            console.log('Accessibility Widget: Panel has active class before toggle:', panel.classList.contains('active'));
            console.log('Accessibility Widget: Panel computed right position before toggle:', window.getComputedStyle(panel).right);
            
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                console.log('Accessibility Widget: Panel closed');
            } else {
                panel.classList.add('active');
                console.log('Accessibility Widget: Panel opened');
            }
            
            console.log('Accessibility Widget: Panel has active class after toggle:', panel.classList.contains('active'));
            console.log('Accessibility Widget: Panel computed right position after toggle:', window.getComputedStyle(panel).right);
            
            // Force a repaint
            panel.offsetHeight;
        } else {
            console.error('Accessibility Widget: Panel not found!');
        }
    }

    showStatement() {
        alert('Accessibility Statement: This website is committed to providing an accessible experience for all users. We follow WCAG 2.1 guidelines and continuously work to improve accessibility.');
    }

    hideInterface() {
        const icon = this.shadowRoot.getElementById('accessibility-icon');
        const panel = this.shadowRoot.getElementById('accessibility-panel');
        
        if (icon) icon.style.display = 'none';
        if (panel) panel.style.display = 'none';
        
        // Show a small "Show Accessibility" button
        const showBtn = document.createElement('button');
        showBtn.id = 'show-accessibility';
        showBtn.innerHTML = 'Show Accessibility';
        showBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 99999;
            font-size: 12px;
        `;
        
        showBtn.addEventListener('click', () => {
            if (icon) icon.style.display = 'flex';
            if (panel) panel.style.display = 'block';
            showBtn.remove();
        });
        
        document.body.appendChild(showBtn);
    }

    handleToggle(feature, enabled) {
        this.settings[feature] = enabled;
        this.saveSettings();
        
        // Special handling for keyboard navigation and screen reader
        if (feature === 'keyboard-nav' || feature === 'screen-reader') {
            this.handleAccessibilityProfiles(feature, enabled);
        } else {
            this.applyFeature(feature, enabled);
        }
        
        // Update widget appearance to sync with global features
        this.updateWidgetAppearance();
    }

    handleAccessibilityProfiles(feature, enabled) {
        // Get the toggle elements from Shadow DOM
        const keyboardToggle = this.shadowRoot.getElementById('keyboard-nav');
        const screenReaderToggle = this.shadowRoot.getElementById('screen-reader');
        
        if (enabled) {
            // When either profile is enabled, enable both
            this.settings['keyboard-nav'] = true;
            this.settings['screen-reader'] = true;
            
            // Update both toggles to checked state
            if (keyboardToggle) keyboardToggle.checked = true;
            if (screenReaderToggle) screenReaderToggle.checked = true;
            
            // Apply both features
            this.applyFeature('keyboard-nav', true);
            this.applyFeature('screen-reader', true);
            
            // Initialize keyboard navigation shortcuts
            this.initKeyboardShortcuts();
            
            // Play sound effect
            this.playAccessibilitySound();
            
            // Save updated settings
            this.saveSettings();
            
            console.log('Accessibility Widget: Both keyboard navigation and screen reader profiles activated');
        } else {
            // When either profile is disabled, disable both
            this.settings['keyboard-nav'] = false;
            this.settings['screen-reader'] = false;
            
            // Update both toggles to unchecked state
            if (keyboardToggle) keyboardToggle.checked = false;
            if (screenReaderToggle) screenReaderToggle.checked = false;
            
            // Remove both features
            this.applyFeature('keyboard-nav', false);
            this.applyFeature('screen-reader', false);
            
            // Remove keyboard shortcuts
            this.removeKeyboardShortcuts();
            
            // Save updated settings
            this.saveSettings();
            
            console.log('Accessibility Widget: Both keyboard navigation and screen reader profiles deactivated');
        }
    }

    initKeyboardShortcuts() {
        // Remove existing shortcuts if any
        this.removeKeyboardShortcuts();
        
        // Initialize element tracking for cycling
        this.currentElementIndex = {};
        this.highlightedElements = [];
        
        // Add keyboard shortcuts for navigation
        this.keyboardShortcutHandler = (e) => {
            // Only activate if keyboard navigation is enabled
            if (!this.settings['keyboard-nav']) {
                console.log('Accessibility Widget: Keyboard navigation not enabled');
                return;
            }
            
            console.log('Accessibility Widget: Key pressed:', e.key, 'Keyboard nav enabled:', this.settings['keyboard-nav']);
            
            // Check if user is typing in an input field
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.contentEditable === 'true')) {
                console.log('Accessibility Widget: Ignoring key press in input field');
                return; // Don't interfere with typing
            }
            
            // Single key navigation (no Alt/Ctrl needed)
            switch(e.key.toLowerCase()) {
                case 'm': // Menus
                    e.preventDefault();
                    console.log('Accessibility Widget: M key pressed - cycling through menus');
                    this.cycleThroughElements('nav, [role="navigation"], .menu, .navbar', 'menu');
                    break;
                case 'h': // Headings
                    e.preventDefault();
                    console.log('Accessibility Widget: H key pressed - cycling through headings');
                    this.cycleThroughElements('h1, h2, h3, h4, h5, h6', 'heading');
                    break;
                case 'f': // Forms
                    e.preventDefault();
                    console.log('Accessibility Widget: F key pressed - cycling through forms');
                    this.cycleThroughElements('form, input, textarea, select, button[type="submit"]', 'form');
                    break;
                case 'b': // Buttons
                    e.preventDefault();
                    console.log('Accessibility Widget: B key pressed - cycling through buttons');
                    this.cycleThroughElements('button, .btn, [role="button"]', 'button');
                    break;
                case 'g': // Graphics/Images
                    e.preventDefault();
                    console.log('Accessibility Widget: G key pressed - cycling through graphics');
                    this.cycleThroughElements('img, svg, canvas, [role="img"]', 'graphic');
                    break;
                case 'l': // Links
                    e.preventDefault();
                    console.log('Accessibility Widget: L key pressed - cycling through links');
                    this.cycleThroughElements('a[href]', 'link');
                    break;
                case 's': // Skip to main content
                    e.preventDefault();
                    console.log('Accessibility Widget: S key pressed - skipping to main content');
                    this.focusElement('main, [role="main"], #main, .main');
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyboardShortcutHandler);
        console.log('Accessibility Widget: Keyboard shortcuts initialized successfully');
    }

    removeKeyboardShortcuts() {
        if (this.keyboardShortcutHandler) {
            document.removeEventListener('keydown', this.keyboardShortcutHandler);
            this.keyboardShortcutHandler = null;
            console.log('Accessibility Widget: Keyboard shortcuts removed');
        }
        
        // Remove all highlighted elements
        this.removeAllHighlights();
        
        // Reset element tracking
        this.currentElementIndex = {};
    }

    cycleThroughElements(selector, type) {
        // Remove previous highlights
        this.removeAllHighlights();
        
        // Get all matching elements
        const elements = Array.from(document.querySelectorAll(selector)).filter(element => 
            this.isElementVisible(element) && this.isElementFocusable(element)
        );
        
        if (elements.length === 0) {
            console.log(`Accessibility Widget: No ${type} elements found`);
            return;
        }
        
        // Initialize or increment index for this type
        if (!this.currentElementIndex[type]) {
            this.currentElementIndex[type] = 0;
        } else {
            this.currentElementIndex[type] = (this.currentElementIndex[type] + 1) % elements.length;
        }
        
        // Get current element
        const currentElement = elements[this.currentElementIndex[type]];
        
        // Highlight the current element
        this.highlightElement(currentElement, type);
        
        // Focus and scroll to element
        currentElement.focus();
        currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log(`Accessibility Widget: Highlighted ${type} ${this.currentElementIndex[type] + 1} of ${elements.length}`);
    }

    highlightElement(element, type) {
        // Create highlight box
        const highlight = document.createElement('div');
        highlight.className = 'keyboard-highlight';
        highlight.setAttribute('data-type', type);
        highlight.style.cssText = `
            position: absolute;
            border: 3px solid #6366f1;
            border-radius: 6px;
            background: transparent;
            pointer-events: none;
            z-index: 1000000;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
            transition: all 0.3s ease;
        `;
        
        // Position the highlight
        const rect = element.getBoundingClientRect();
        highlight.style.top = (rect.top + window.scrollY - 3) + 'px';
        highlight.style.left = (rect.left + window.scrollX - 3) + 'px';
        highlight.style.width = (rect.width + 6) + 'px';
        highlight.style.height = (rect.height + 6) + 'px';
        
        // Add to document
        document.body.appendChild(highlight);
        this.highlightedElements.push(highlight);
        
        // Add label
        const label = document.createElement('div');
        label.className = 'keyboard-highlight-label';
        label.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.currentElementIndex[type] + 1}`;
        label.style.cssText = `
            position: absolute;
            top: -30px;
            left: 0;
            background: #6366f1;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            white-space: nowrap;
            z-index: 1000001;
        `;
        
        highlight.appendChild(label);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.remove();
                this.highlightedElements = this.highlightedElements.filter(h => h !== highlight);
            }
        }, 3000);
    }


    focusElement(selector) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            // Find the first visible and focusable element
            for (let element of elements) {
                if (this.isElementVisible(element) && this.isElementFocusable(element)) {
                    element.focus();
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add temporary highlight
                    element.style.outline = '3px solid var(--primary-color)';
                    element.style.outlineOffset = '2px';
                    
                    setTimeout(() => {
                        element.style.outline = '';
                        element.style.outlineOffset = '';
                    }, 2000);
                    
                    console.log(`Accessibility Widget: Focused on ${selector}`);
                    return;
                }
            }
        }
        console.log(`Accessibility Widget: No focusable elements found for ${selector}`);
    }

    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    isElementFocusable(element) {
        const tag = element.tagName.toLowerCase();
        const type = element.type;
        
        // Check if element is naturally focusable
        if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea' || tag === 'select') {
            return true;
        }
        
        // Check if element has tabindex
        if (element.hasAttribute('tabindex') && element.getAttribute('tabindex') !== '-1') {
            return true;
        }
        
        // Check if element has role that makes it focusable
        const role = element.getAttribute('role');
        if (role === 'button' || role === 'link' || role === 'menuitem' || role === 'tab') {
            return true;
        }
        
        return false;
    }

    playAccessibilitySound() {
        try {
            // Create audio context for sound generation
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Configure sound (pleasant notification sound)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1); // Rise to 1000Hz
            
            // Configure volume envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            // Play the sound
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            console.log('Accessibility Widget: Sound effect played');
        } catch (error) {
            console.log('Accessibility Widget: Could not play sound effect', error);
        }
    }

    applyFeature(feature, enabled) {
        console.log(`Accessibility Widget: Applying feature ${feature}: ${enabled}`);
        
        const body = document.body;
        
        if (enabled) {
            body.classList.add(feature);
            
            // Special handling for specific features
            switch(feature) {
                case 'keyboard-nav':
                    this.initKeyboardShortcuts();
                    console.log('Accessibility Widget: Keyboard navigation enabled');
                    break;
                case 'text-magnifier':
                    this.initTextMagnifier(); // Initialize first
                    this.enableTextMagnifier();
                    break;
                case 'font-sizing':
                    this.enableFontSizing();
                    this.showFontSizingControls();
                    break;
                case 'content-scaling':
                    this.showContentScalingControls();
                    break;
                case 'adjust-line-height':
                    this.showLineHeightControls();
                    break;
                case 'adjust-letter-spacing':
                    this.showLetterSpacingControls();
                    break;
                case 'highlight-titles':
                    this.highlightTitles();
                    break;
                case 'highlight-links':
                    this.highlightLinks();
                    break;
                case 'adjust-text-colors':
                    this.showTextColorPicker();
                    break;
                case 'adjust-title-colors':
                    this.showTitleColorPicker();
                    break;
                case 'adjust-bg-colors':
                    this.showBackgroundColorPicker();
                    break;
                case 'mute-sound':
                    this.enableMuteSound();
                    break;
                case 'read-mode':
                    this.enableReadMode();
                    break;
                case 'reading-guide':
                    this.enableReadingGuide();
                    break;
                case 'reading-mask':
                    this.enableReadingMask();
                    break;
                case 'useful-links':
                    this.enableUsefulLinks();
                    break;
                case 'highlight-hover':
                    this.enableHighlightHover();
                    break;
                case 'highlight-focus':
                    this.enableHighlightFocus();
                    break;
                case 'adhd-friendly':
                    this.createADHDSpotlight();
                    break;
                case 'screen-reader':
                    this.enhanceScreenReaderSupport();
                    break;
                case 'high-contrast':
                    this.enableHighContrast();
                    break;
                case 'high-saturation':
                    this.enableHighSaturation();
                    break;
                case 'monochrome':
                    this.enableMonochrome();
                    break;
                case 'dark-contrast':
                    this.enableDarkContrast();
                    break;
                case 'light-contrast':
                    this.enableLightContrast();
                    break;
                case 'seizure-safe':
                    this.enableSeizureSafe();
                    break;
                case 'vision-impaired':
                    this.enableVisionImpaired();
                    break;
                case 'cognitive-disability':
                    this.enableCognitiveDisability();
                    break;
                case 'readable-font':
                    this.enableReadableFont();
                    break;
                case 'align-center':
                    this.enableAlignCenter();
                    break;
                case 'align-left':
                    this.enableAlignLeft();
                    break;
                case 'align-right':
                    this.enableAlignRight();
                    break;
            }
        } else {
            body.classList.remove(feature);
            
            // Special handling for specific features
            switch(feature) {
                case 'keyboard-nav':
                    this.removeKeyboardShortcuts();
                    console.log('Accessibility Widget: Keyboard navigation disabled');
                    break;
                case 'text-magnifier':
                    this.disableTextMagnifier();
                    break;
                case 'font-sizing':
                    this.disableFontSizing();
                    this.hideFontSizingControls();
                    break;
                case 'content-scaling':
                    this.hideContentScalingControls();
                    this.resetContentScale();
                    break;
                case 'adjust-line-height':
                    this.hideLineHeightControls();
                    this.resetLineHeight();
                    break;
                case 'adjust-letter-spacing':
                    this.hideLetterSpacingControls();
                    this.resetLetterSpacing();
                    break;
                case 'highlight-titles':
                    this.removeTitleHighlights();
                    break;
                case 'highlight-links':
                    this.removeLinkHighlights();
                    break;
                case 'adhd-friendly':
                    this.removeADHDSpotlight();
                    break;
                case 'screen-reader':
                    this.removeScreenReaderEnhancements();
                    break;
                case 'high-contrast':
                    this.disableHighContrast();
                    break;
                case 'high-saturation':
                    this.disableHighSaturation();
                    break;
                case 'monochrome':
                    this.disableMonochrome();
                    break;
                case 'dark-contrast':
                    this.disableDarkContrast();
                    break;
                case 'light-contrast':
                    this.disableLightContrast();
                    break;
                case 'seizure-safe':
                    this.disableSeizureSafe();
                    break;
                case 'vision-impaired':
                    this.disableVisionImpaired();
                    break;
                case 'cognitive-disability':
                    this.disableCognitiveDisability();
                    break;
                case 'readable-font':
                    this.disableReadableFont();
                    break;
                case 'align-center':
                    this.disableAlignCenter();
                    break;
                case 'align-left':
                    this.disableAlignLeft();
                    break;
                case 'align-right':
                    this.disableAlignRight();
                    break;
                case 'adjust-text-colors':
                    this.hideTextColorPicker();
                    this.resetTextColors();
                    break;
                case 'adjust-title-colors':
                    this.hideTitleColorPicker();
                    this.resetTitleColors();
                    break;
                case 'adjust-bg-colors':
                    this.hideBackgroundColorPicker();
                    this.resetBackgroundColors();
                    break;
                case 'mute-sound':
                    this.disableMuteSound();
                    break;
                case 'read-mode':
                    this.disableReadMode();
                    break;
                case 'reading-guide':
                    this.disableReadingGuide();
                    break;
                case 'reading-mask':
                    this.disableReadingMask();
                    break;
                case 'useful-links':
                    this.disableUsefulLinks();
                    break;
                case 'highlight-hover':
                    this.disableHighlightHover();
                    break;
                case 'highlight-focus':
                    this.disableHighlightFocus();
                    break;
            }
        }
    }

    enhanceScreenReaderSupport() {
        // Add skip link if it doesn't exist
        if (!document.getElementById('skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.id = 'skip-link';
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--primary-color);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 1000000;
                transition: top 0.3s;
            `;
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // Add ARIA landmarks if they don't exist
        this.addAriaLandmarks();
        
        // Enhance form labels and inputs
        this.enhanceFormAccessibility();
        
        // Add alt text to images without alt
        this.addAltTextToImages();
        
        console.log('Accessibility Widget: Screen reader support enhanced');
    }

    removeScreenReaderEnhancements() {
        // Remove skip link
        const skipLink = document.getElementById('skip-link');
        if (skipLink) {
            skipLink.remove();
        }
        
        // Remove added ARIA attributes
        this.removeAriaEnhancements();
        
        console.log('Accessibility Widget: Screen reader enhancements removed');
    }

    addAriaLandmarks() {
        // Add main landmark if it doesn't exist
        const mainContent = document.querySelector('main, [role="main"], #main, .main');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        // Add navigation landmarks
        const navs = document.querySelectorAll('nav');
        navs.forEach((nav, index) => {
            if (!nav.getAttribute('aria-label')) {
                nav.setAttribute('aria-label', `Navigation ${index + 1}`);
            }
        });
        
        // Add banner landmark
        const header = document.querySelector('header');
        if (header && !header.getAttribute('role')) {
            header.setAttribute('role', 'banner');
        }
        
        // Add contentinfo landmark
        const footer = document.querySelector('footer');
        if (footer && !footer.getAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
    }

    removeAriaEnhancements() {
        // Remove added ARIA attributes (be careful not to remove existing ones)
        const skipLink = document.getElementById('skip-link');
        if (skipLink) {
            skipLink.remove();
        }
    }

    enhanceFormAccessibility() {
        // Add labels to inputs without labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input, index) => {
            if (!input.id && !input.getAttribute('aria-label')) {
                const label = input.previousElementSibling;
                if (label && label.tagName === 'LABEL') {
                    input.id = `input-${index}`;
                    label.setAttribute('for', input.id);
                } else {
                    input.setAttribute('aria-label', `Input field ${index + 1}`);
                }
            }
        });
    }

    addAltTextToImages() {
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.alt && !img.getAttribute('aria-label')) {
                img.setAttribute('alt', `Image ${index + 1}`);
            }
        });
    }

    createADHDSpotlight() {
        // Remove existing spotlight if any
        this.removeADHDSpotlight();
        
        // Create spotlight container
        const spotlightContainer = document.createElement('div');
        spotlightContainer.id = 'adhd-spotlight-container';
        spotlightContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 100001;
            overflow: hidden;
        `;
        document.body.appendChild(spotlightContainer);
        
        // Create spotlight with original styling
        const spotlight = document.createElement('div');
        spotlight.id = 'adhd-spotlight';
        spotlight.style.cssText = `
            position: absolute;
            width: 100%;
            height: 150px;
            background: transparent;
            backdrop-filter: brightness(2.0) contrast(1.2);
            box-shadow: inset 0 0 60px rgba(255, 255, 255, 0.4);
            border-top: 2px solid rgba(255, 255, 255, 0.6);
            border-bottom: 2px solid rgba(255, 255, 255, 0.6);
            transform: translateY(-50%);
            transition: none;
            border-radius: 8px;
            filter: none;
        `;
        spotlightContainer.appendChild(spotlight);
        
        // Add mouse move event listener
        this.adhdMouseMoveHandler = (e) => {
            spotlight.style.top = e.clientY + 'px';
        };
        
        document.addEventListener('mousemove', this.adhdMouseMoveHandler);
        console.log('Accessibility Widget: ADHD spotlight created');
    }

    removeADHDSpotlight() {
        const spotlightContainer = document.getElementById('adhd-spotlight-container');
        if (spotlightContainer) {
            spotlightContainer.remove();
        }
        
        // Remove mouse move event listener
        if (this.adhdMouseMoveHandler) {
            document.removeEventListener('mousemove', this.adhdMouseMoveHandler);
            this.adhdMouseMoveHandler = null;
        }
        
        console.log('Accessibility Widget: ADHD spotlight removed');
    }

    initTextMagnifier() {
        // Remove existing magnifier if any
        const existingMagnifier = document.getElementById('text-magnifier');
        if (existingMagnifier) {
            existingMagnifier.remove();
        }
        
        const magnifier = document.createElement('div');
        magnifier.className = 'magnifier';
        magnifier.id = 'text-magnifier';
        magnifier.style.cssText = `
            position: fixed;
            display: none;
            z-index: 1000000;
            pointer-events: none;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(magnifier);
        console.log('Accessibility Widget: Text magnifier initialized');
    }

    enableTextMagnifier() {
        // Initialize magnifier if not exists
        this.initTextMagnifier();
        
        const magnifier = document.getElementById('text-magnifier');
        if (!magnifier) {
            console.error('Accessibility Widget: Text magnifier not found');
            return;
        }
        
        // Add hover effects to text elements and interactive elements
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, label, li, td, th, img, .logo, .nav-logo, .nav-menu li, .navbar, nav, header, .header, .menu, .nav-item, [role="button"], [role="link"], [role="menuitem"]');
        
        textElements.forEach(element => {
            // Skip accessibility widget elements (check both shadow DOM and regular DOM)
            if (element.closest('.accessibility-panel') || 
                element.closest('#accessibility-icon') ||
                element.closest('accessibility-widget') ||
                element.tagName === 'ACCESSIBILITY-WIDGET' ||
                element.id === 'accessibility-icon' ||
                element.id === 'accessibility-panel') {
                return;
            }
            
            // Create named event handlers that can be removed later
            const mouseEnterHandler = (e) => {
                // Show magnified text in semi-transparent black box
                if (magnifier && element.textContent && element.textContent.trim()) {
                    // Get the full text content, including nested elements
                    let fullText = '';
                    
                    // Handle different types of elements
                    if (element.tagName === 'IMG') {
                        // For images, use alt text or title
                        fullText = element.alt || element.title || 'Image';
                    } else if (element.hasAttribute('aria-label')) {
                        // For elements with aria-label
                        fullText = element.getAttribute('aria-label');
                    } else if (element.hasAttribute('title')) {
                        // For elements with title attribute
                        fullText = element.getAttribute('title');
                    } else if (element.children.length > 0) {
                        // If element has children, get text from all child elements
                        fullText = element.innerText || element.textContent;
                    } else {
                        // If it's a simple text element
                        fullText = element.textContent || element.innerText;
                    }
                    
                    // Clean up the text (remove extra whitespace)
                    fullText = fullText.replace(/\s+/g, ' ').trim();
                    
                    if (fullText) {
                        // Calculate position to keep popup within viewport
                        const viewportWidth = window.innerWidth;
                        const viewportHeight = window.innerHeight;
                        
                        // Set initial position
                        let left = e.clientX + 20;
                        let top = e.clientY - 50;
                        
                        // After setting content, we'll adjust position if needed
                        magnifier.style.left = left + 'px';
                        magnifier.style.top = top + 'px';
                        magnifier.style.fontSize = '24px'; // Increased font size
                        magnifier.style.fontWeight = 'bold';
                        magnifier.style.background = 'rgba(0, 0, 0, 0.8)';
                        magnifier.style.color = 'white';
                        magnifier.style.padding = '16px 20px'; // Increased padding
                        magnifier.style.borderRadius = '8px';
                        magnifier.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.5)';
                        magnifier.style.zIndex = '1000000';
                        magnifier.style.width = 'auto'; // Auto width based on content
                        magnifier.style.maxWidth = '600px'; // Maximum width limit
                        magnifier.style.wordWrap = 'break-word';
                        magnifier.style.lineHeight = '1.4';
                        magnifier.style.whiteSpace = 'normal'; // Allow text to wrap naturally
                        magnifier.style.overflow = 'visible'; // No scroll, let it grow
                        magnifier.style.height = 'auto'; // Auto height based on content
                        magnifier.textContent = fullText; // Show complete text
                        magnifier.style.display = 'block';
                        
                        // Now adjust position based on actual popup size
                        setTimeout(() => {
                            const popupRect = magnifier.getBoundingClientRect();
                            const popupWidth = popupRect.width;
                            const popupHeight = popupRect.height;
                            
                            // Adjust left position if popup goes off right edge
                            if (left + popupWidth > viewportWidth) {
                                left = e.clientX - popupWidth - 20; // Show to the left of cursor
                                magnifier.style.left = left + 'px';
                            }
                            
                            // Adjust top position if popup goes off bottom
                            if (top + popupHeight > viewportHeight) {
                                top = viewportHeight - popupHeight - 10;
                                magnifier.style.top = top + 'px';
                            }
                        }, 10);
                        
                        // Check if popup goes off top edge
                        if (top < 10) {
                            top = e.clientY + 20; // Show below cursor if too close to top
                            magnifier.style.top = top + 'px';
                        }
                        console.log('Accessibility Widget: Showing full magnified text:', fullText);
                    }
                }
            };
            
            const mouseLeaveHandler = (e) => {
                // Hide magnifier
                if (magnifier) {
                    magnifier.style.display = 'none';
                }
            };
            
            // Store handlers for later removal
            this.textMagnifierHandlers.set(element, {
                mouseenter: mouseEnterHandler,
                mouseleave: mouseLeaveHandler
            });
            
            // Add event listeners
            element.addEventListener('mouseenter', mouseEnterHandler);
            element.addEventListener('mouseleave', mouseLeaveHandler);
        });
        
        console.log('Accessibility Widget: Text magnifier enabled with hover effects on', textElements.length, 'elements');
    }

    disableTextMagnifier() {
        console.log('Accessibility Widget: Disabling text magnifier...');
        
        const magnifier = document.getElementById('text-magnifier');
        if (magnifier) {
            magnifier.style.display = 'none';
        }
        
        // Check if accessibility widget is still visible
        const widgetContainer = document.getElementById('accessibility-widget-container');
        const widgetIcon = document.getElementById('accessibility-icon');
        console.log('Accessibility Widget: Widget container exists:', !!widgetContainer);
        console.log('Accessibility Widget: Widget icon exists:', !!widgetIcon);
        
        if (widgetContainer) {
            console.log('Accessibility Widget: Widget container display:', window.getComputedStyle(widgetContainer).display);
            console.log('Accessibility Widget: Widget container visibility:', window.getComputedStyle(widgetContainer).visibility);
        }
        
        // Remove hover effects from text elements and interactive elements
        const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, button, label, li, td, th, img, .logo, .nav-logo, .nav-menu li, .navbar, nav, header, .header, .menu, .nav-item, [role="button"], [role="link"], [role="menuitem"]');
        
        textElements.forEach(element => {
            // Skip accessibility widget elements (check both shadow DOM and regular DOM)
            if (element.closest('.accessibility-panel') || 
                element.closest('#accessibility-icon') ||
                element.closest('accessibility-widget') ||
                element.tagName === 'ACCESSIBILITY-WIDGET' ||
                element.id === 'accessibility-icon' ||
                element.id === 'accessibility-panel') {
                return;
            }
            
            // Remove highlight effects
            element.style.background = '';
            element.style.border = '';
            element.style.borderRadius = '';
            element.style.padding = '';
            element.style.boxShadow = '';
            element.style.transform = '';
            element.style.transition = '';
            
            // Remove event listeners using stored handlers
            const handlers = this.textMagnifierHandlers.get(element);
            if (handlers) {
                element.removeEventListener('mouseenter', handlers.mouseenter);
                element.removeEventListener('mouseleave', handlers.mouseleave);
                this.textMagnifierHandlers.delete(element);
            }
        });
        
        // Check widget visibility again after cleanup
        if (widgetContainer) {
            console.log('Accessibility Widget: After cleanup - Widget container display:', window.getComputedStyle(widgetContainer).display);
            console.log('Accessibility Widget: After cleanup - Widget container visibility:', window.getComputedStyle(widgetContainer).visibility);
        }
        
        console.log('Accessibility Widget: Text magnifier disabled');
    }

    enableFontSizing() {
        // Use the inline controls instead of creating separate panel
        this.showFontSizingControls();
        console.log('Accessibility Widget: Font sizing enabled');
        
        // Test if controls exist
        const controls = this.shadowRoot.getElementById('font-sizing-controls');
        if (controls) {
            console.log('Accessibility Widget: Font sizing controls found');
        } else {
            console.error('Accessibility Widget: Font sizing controls not found');
        }
    }

    disableFontSizing() {
        // Reset font size to normal when disabling
        this.fontSize = 100;
        this.resetFontSize();
        
        // Hide the controls
        const controls = this.shadowRoot.getElementById('font-sizing-controls');
        if (controls) {
            controls.style.display = 'none';
        }
        
        console.log('Accessibility Widget: Font sizing disabled and reset to normal');
    }

    changeFontSize(factor) {
        const currentSize = parseFloat(getComputedStyle(document.body).fontSize);
        document.body.style.fontSize = (currentSize * factor) + 'px';
    }

    resetFontSize() {
        // Reset body font size
        document.body.style.fontSize = '';
        
        // Remove any inline font-size styles that were applied to individual elements
        const elements = document.querySelectorAll('*');
        let resetCount = 0;
        elements.forEach(element => {
            if (element.style.fontSize) {
                element.style.fontSize = '';
                resetCount++;
            }
        });
        
        // Reset the internal value
        this.fontSize = 100;
        
        // Force update the display
        this.updateFontSizeDisplay();
        
        console.log('Accessibility Widget: Font size reset to original website styling. Reset', resetCount, 'elements.');
        
        // Additional safety: ensure no font-size styles remain
        setTimeout(() => {
            const remainingElements = document.querySelectorAll('[style*="font-size"]');
            if (remainingElements.length > 0) {
                console.log('Accessibility Widget: Found remaining font-size styles, clearing them...');
                remainingElements.forEach(element => {
                    element.style.fontSize = '';
                });
            }
        }, 100);
    }


    // Content Scaling Methods
    increaseContentScale() {
        this.contentScale = Math.min(this.contentScale + 5, 200); // 5% increment
        this.updateContentScale();
        this.updateContentScaleDisplay();
    }

    decreaseContentScale() {
        this.contentScale = Math.max(this.contentScale - 5, 50); // 5% decrement, minimum 50%
        this.updateContentScale();
        this.updateContentScaleDisplay();
    }

    updateContentScale() {
        const scale = this.contentScale / 100;
        
        // Apply scaling to the entire website body
        const body = document.body;
        const html = document.documentElement;
        
        // Skip accessibility widget container from scaling
        const widgetContainer = document.getElementById('accessibility-widget-container');
        if (widgetContainer) {
            widgetContainer.style.transform = 'scale(1)'; // Keep accessibility widget at normal size
            widgetContainer.style.transformOrigin = 'center center';
        }
        
        // Scale the entire body
        body.style.transform = `scale(${scale})`;
        body.style.transformOrigin = 'top left';
        body.style.width = `${100 / scale}%`;
        body.style.height = `${100 / scale}%`;
        
        // Allow scrolling but adjust viewport to accommodate scaling
        html.style.overflow = 'auto'; // Allow scrolling instead of hidden
        html.style.maxWidth = 'none'; // Remove width restriction
        html.style.maxHeight = 'none'; // Remove height restriction
        
        // Adjust body positioning to account for scaling
        body.style.position = 'relative';
        body.style.left = '0';
        body.style.top = '0';
        
        console.log('Accessibility Widget: Content scaled to', this.contentScale + '%');
    }

    updateContentScaleDisplay() {
        const display = document.getElementById('content-scale-value');
        if (display) {
            display.textContent = this.contentScale + '%';
        }
    }

    toggleContentScalingControls(enabled) {
        const controls = this.shadowRoot.getElementById('content-scaling-controls');
        if (controls) {
            controls.style.display = enabled ? 'block' : 'none';
        }
        
        if (enabled) {
            this.updateContentScaleDisplay();
        } else {
                    // Reset content scale when disabled
        this.contentScale = 100;
        this.updateContentScale();
        
        // Reset line height when disabled
        this.lineHeight = 100;
        this.resetLineHeight();
        }
    }

    toggleFontSizingControls(enabled) {
        const controls = this.shadowRoot.getElementById('font-sizing-controls');
        if (controls) {
            controls.style.display = enabled ? 'block' : 'none';
        }
        
        if (enabled) {
            this.updateFontSizeDisplay();
        } else {
            // Reset font size when disabled
            this.fontSize = 100;
            this.resetFontSize();
        }
    }

    toggleLineHeightControls(enabled) {
        console.log('Accessibility Widget: toggleLineHeightControls called with enabled:', enabled);
        console.log('Accessibility Widget: this context in toggleLineHeightControls:', this);
        
        const controls = this.shadowRoot.getElementById('line-height-controls');
        console.log('Accessibility Widget: Line height controls found:', !!controls);
        if (controls) {
            controls.style.display = enabled ? 'block' : 'none';
            console.log('Accessibility Widget: Controls display set to:', enabled ? 'block' : 'none');
        }
        
        if (enabled) {
            // Show controls and ensure line height is at 100% (normal) when controls are shown
            this.lineHeight = 100;
            this.updateLineHeightDisplay();
            
            console.log('Accessibility Widget: About to call bindLineHeightEvents...');
            console.log('Accessibility Widget: this.bindLineHeightEvents exists:', typeof this.bindLineHeightEvents);
            
            // Bind events to the line height buttons when they become visible
            this.bindLineHeightEvents();
            
            console.log('Accessibility Widget: Line height controls shown, value set to 100% (normal)');
        } else {
            // Reset line height when disabled
            this.lineHeight = 100;
            this.resetLineHeight();
            console.log('Accessibility Widget: Line height reset to original website styling');
        }
    }

    showLineHeightControls() {
        const controls = this.shadowRoot.getElementById('line-height-controls');
        if (controls) {
            controls.style.display = 'block';
        }
    }

    hideLineHeightControls() {
        const controls = this.shadowRoot.getElementById('line-height-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    bindLineHeightEvents() {
        console.log('Accessibility Widget: Binding line height events...');
        console.log('Accessibility Widget: this context in bindLineHeightEvents:', this);
        console.log('Accessibility Widget: this.shadowRoot exists:', !!this.shadowRoot);
        
        // Wait a bit for the DOM to be ready
        setTimeout(() => {
            // Line height control buttons - using Shadow DOM
            const decreaseLineHeightBtn = this.shadowRoot.getElementById('decrease-line-height-btn');
            console.log('Accessibility Widget: Decrease line height button found:', !!decreaseLineHeightBtn);
            if (decreaseLineHeightBtn) {
                console.log('Accessibility Widget: Decrease button HTML:', decreaseLineHeightBtn.outerHTML);
                
                // Remove any existing event listeners first
                decreaseLineHeightBtn.removeEventListener('click', this.decreaseLineHeightHandler);
                
                // Create a bound handler
                this.decreaseLineHeightHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Accessibility Widget: DECREASE line height button clicked');
                    console.log('Accessibility Widget: Button ID:', e.target.id);
                    console.log('Accessibility Widget: Button text:', e.target.textContent);
                    console.log('Accessibility Widget: Current lineHeight before decrease:', this.lineHeight);
                    console.log('Accessibility Widget: this context in click handler:', this);
                    console.log('Accessibility Widget: this.decreaseLineHeight exists:', typeof this.decreaseLineHeight);
                    this.decreaseLineHeight();
                };
                
                // Add event listener
                decreaseLineHeightBtn.addEventListener('click', this.decreaseLineHeightHandler);
                console.log('Accessibility Widget: Decrease line height event listener attached');
            } else {
                console.error('Accessibility Widget: Decrease line height button NOT found!');
            }

            const increaseLineHeightBtn = this.shadowRoot.getElementById('increase-line-height-btn');
            console.log('Accessibility Widget: Increase line height button found:', !!increaseLineHeightBtn);
            if (increaseLineHeightBtn) {
                console.log('Accessibility Widget: Increase button HTML:', increaseLineHeightBtn.outerHTML);
                
                // Remove any existing event listeners first
                increaseLineHeightBtn.removeEventListener('click', this.increaseLineHeightHandler);
                
                // Create a bound handler
                this.increaseLineHeightHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Accessibility Widget: INCREASE line height button clicked');
                    console.log('Accessibility Widget: Button ID:', e.target.id);
                    console.log('Accessibility Widget: Button text:', e.target.textContent);
                    console.log('Accessibility Widget: Current lineHeight before increase:', this.lineHeight);
                    console.log('Accessibility Widget: this context in click handler:', this);
                    console.log('Accessibility Widget: this.increaseLineHeight exists:', typeof this.increaseLineHeight);
                    this.increaseLineHeight();
                };
                
                // Add event listener
                increaseLineHeightBtn.addEventListener('click', this.increaseLineHeightHandler);
                console.log('Accessibility Widget: Increase line height event listener attached');
            } else {
                console.error('Accessibility Widget: Increase line height button NOT found!');
            }
        }, 100); // Small delay to ensure DOM is ready
    }

    // Line Height Methods
    updateLineHeight() {
        // Store original line-height if not already stored
        if (this.originalLineHeight === null) {
            const computedStyle = window.getComputedStyle(document.body);
            this.originalLineHeight = parseFloat(computedStyle.lineHeight);
            console.log('Accessibility Widget: Stored original line-height:', this.originalLineHeight);
        }
        
        // Use a much simpler approach - map percentages directly to reasonable line-height values
        let lineHeightValue;
        if (this.lineHeight <= 100) {
            // For 80-100%, map to 1.3 to 1.6 (original)
            lineHeightValue = 1.3 + (this.lineHeight - 80) * 0.015; // 80% = 1.3, 100% = 1.6
        } else {
            // For 100-150%, map to 1.6 to 1.8 (very conservative)
            lineHeightValue = 1.6 + (this.lineHeight - 100) * 0.004; // 100% = 1.6, 150% = 1.8
        }
        
        console.log('Accessibility Widget: updateLineHeight - lineHeight:', this.lineHeight + '%, original:', this.originalLineHeight + ', lineHeightValue:', lineHeightValue);
        console.log('Accessibility Widget: Calculation details - this.lineHeight:', this.lineHeight, '<= 100?', this.lineHeight <= 100);
        if (this.lineHeight <= 100) {
            console.log('Accessibility Widget: Using formula: 1.3 + (' + this.lineHeight + ' - 80) * 0.015 =', 1.3 + (this.lineHeight - 80) * 0.015);
        } else {
            console.log('Accessibility Widget: Using formula: 1.6 + (' + this.lineHeight + ' - 100) * 0.004 =', 1.6 + (this.lineHeight - 100) * 0.004);
        }
        
        // Apply line-height directly to body and html
        document.body.style.setProperty('line-height', lineHeightValue, 'important');
        document.documentElement.style.setProperty('line-height', lineHeightValue, 'important');
        console.log('Accessibility Widget: Applied lineHeight to body and html:', lineHeightValue + ' (important)');
        console.log('Accessibility Widget: Body computed line-height after application:', window.getComputedStyle(document.body).lineHeight);
        console.log('Accessibility Widget: Body style line-height:', document.body.style.lineHeight);
        
        // Apply to all text elements except accessibility panel with more specific targeting
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer, main');
        console.log('Accessibility Widget: Found', textElements.length, 'text elements to update');
        
        let updatedCount = 0;
        textElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                // Use multiple approaches to ensure the line height is applied
                element.style.setProperty('line-height', lineHeightValue, 'important');
                element.style.lineHeight = lineHeightValue + ' !important';
                updatedCount++;
            }
        });
        
        console.log('Accessibility Widget: Updated', updatedCount, 'elements with lineHeight:', lineHeightValue);
        console.log('Accessibility Widget: Line height updated to', this.lineHeight + '% (value:', lineHeightValue + ')');
    }

    increaseLineHeight() {
        console.log('Accessibility Widget: increaseLineHeight called - Current lineHeight:', this.lineHeight);
        const oldLineHeight = this.lineHeight;
        this.lineHeight = Math.min(this.lineHeight + 2, 150);
        console.log('Accessibility Widget: Line height changed from', oldLineHeight + '% to', this.lineHeight + '%');
        this.updateLineHeight();
        this.updateLineHeightDisplay();
        console.log('Accessibility Widget: Line height increased to', this.lineHeight + '%');
    }

    decreaseLineHeight() {
        console.log('Accessibility Widget: decreaseLineHeight called - Current lineHeight:', this.lineHeight);
        const oldLineHeight = this.lineHeight;
        this.lineHeight = Math.max(this.lineHeight - 2, 80);
        console.log('Accessibility Widget: Line height changed from', oldLineHeight + '% to', this.lineHeight + '%');
        this.updateLineHeight();
        this.updateLineHeightDisplay();
        console.log('Accessibility Widget: Line height decreased to', this.lineHeight + '%');
    }

    updateLineHeightDisplay() {
        const display = this.shadowRoot.getElementById('line-height-value');
        if (display) {
            display.textContent = this.lineHeight + '%';
        }
    }

    resetLineHeight() {
        console.log('Accessibility Widget: Starting line height reset...');
        
        // Reset line height back to original website styling
        document.body.style.removeProperty('line-height');
        document.documentElement.style.removeProperty('line-height');
        
        // Remove any inline line-height styles that might have been added
        const elements = document.querySelectorAll('*');
        let resetCount = 0;
        elements.forEach(element => {
            if (element.style.lineHeight) {
                element.style.lineHeight = '';
                resetCount++;
            }
        });
        
        // Reset the internal value
        this.lineHeight = 100;
        
        // Force update the display
        this.updateLineHeightDisplay();
        
        console.log('Accessibility Widget: Line height reset to original website styling. Reset', resetCount, 'elements.');
        
    }

    toggleLetterSpacingControls(enabled) {
        console.log('*** DEBUGGING: toggleLetterSpacingControls called with enabled:', enabled + ' ***');
        const controls = this.shadowRoot.getElementById('letter-spacing-controls');
        if (controls) {
            controls.style.display = enabled ? 'block' : 'none';
            console.log('*** Controls display set to:', enabled ? 'block' : 'none' + ' ***');
        }
        
        if (enabled) {
            console.log('*** Toggle enabled - calling updateLetterSpacingDisplay() ***');
            this.updateLetterSpacingDisplay();
        } else {
            console.log('*** Toggle disabled - resetting letter spacing ***');
            // Reset letter spacing when disabled
            this.letterSpacing = 100;
            this.resetLetterSpacing();
        }
    }






    increaseFontSize() {
        console.log('Accessibility Widget: increaseFontSize called');
        this.fontSize = Math.min(this.fontSize + 10, 200);
        this.updateFontSizeEnhanced();
        this.updateFontSizeDisplay();
        console.log('Accessibility Widget: Font size increased to', this.fontSize + '%');
    }

    decreaseFontSize() {
        console.log('Accessibility Widget: decreaseFontSize called');
        this.fontSize = Math.max(this.fontSize - 10, 50);
        this.updateFontSizeEnhanced();
        this.updateFontSizeDisplay();
        console.log('Accessibility Widget: Font size decreased to', this.fontSize + '%');
    }

    // Letter Spacing Methods
    increaseLetterSpacing() {
        console.log('Accessibility Widget: increaseLetterSpacing called');
        this.letterSpacing = Math.min(this.letterSpacing + 10, 200);
        this.updateLetterSpacing();
        this.updateLetterSpacingDisplay();
        console.log('Accessibility Widget: Letter spacing increased to', this.letterSpacing + '%');
    }

    decreaseLetterSpacing() {
        console.log('Accessibility Widget: decreaseLetterSpacing called');
        this.letterSpacing = Math.max(this.letterSpacing - 10, 50);
        this.updateLetterSpacing();
        this.updateLetterSpacingDisplay();
        console.log('Accessibility Widget: Letter spacing decreased to', this.letterSpacing + '%');
    }

    updateLetterSpacing() {
        console.log('*** DEBUGGING: updateLetterSpacing called ***');
        console.log('*** Current letterSpacing value:', this.letterSpacing + '% ***');
        console.trace('*** Call stack trace ***');
        const scale = this.letterSpacing / 100;
        // At 100%, letter spacing should be 0px (no change)
        // At 150%, letter spacing should be 0.5px
        // At 200%, letter spacing should be 1px
        const letterSpacingValue = `${(scale - 1) * 0.5}px`;
        console.log('*** Calculated letterSpacingValue:', letterSpacingValue + ' ***');
        
        // Apply to body
        document.body.style.letterSpacing = letterSpacingValue;
        
        // Apply to all text elements except accessibility panel
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select');
        
        textElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.letterSpacing = letterSpacingValue;
            }
        });
        
        console.log('Accessibility Widget: Letter spacing updated to', this.letterSpacing + '%');
    }

    // Enhanced font size method
    updateFontSizeEnhanced() {
        const scale = this.fontSize / 100;
        const baseFontSize = scale * 16;
        
        // Apply to body
        document.body.style.fontSize = `${baseFontSize}px`;
        
        // Apply to all text elements except accessibility panel
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select');
        
        textElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                // Get current font size and scale it
                const currentSize = parseFloat(window.getComputedStyle(element).fontSize);
                if (currentSize && !isNaN(currentSize)) {
                    element.style.fontSize = `${currentSize * scale}px`;
                }
            }
        });
        
        console.log('Accessibility Widget: Font size updated to', this.fontSize + '%');
    }

    updateLetterSpacingDisplay() {
        console.log('*** DEBUGGING: updateLetterSpacingDisplay called ***');
        console.log('*** Current letterSpacing value:', this.letterSpacing + '% ***');
        const display = this.shadowRoot.getElementById('letter-spacing-value');
        if (display) {
            display.textContent = this.letterSpacing + '%';
            console.log('*** Display updated to:', this.letterSpacing + '% ***');
        } else {
            console.log('*** Display element not found ***');
        }
    }

    resetLetterSpacing() {
        console.log('Accessibility Widget: Resetting letter spacing to original state');
        
        // Reset the letter spacing value to 100%
        this.letterSpacing = 100;
        
        // Reset letter spacing back to original website styling
        document.body.style.removeProperty('letter-spacing');
        
        // Remove any inline letter-spacing styles that might have been added
        const elements = document.querySelectorAll('*');
        let resetCount = 0;
        elements.forEach(element => {
            if (element.style.letterSpacing) {
                element.style.removeProperty('letter-spacing');
                resetCount++;
            }
        });
        
        // Update the display to show 100%
        this.updateLetterSpacingDisplay();
        
        console.log('Accessibility Widget: Letter spacing reset to original - cleared', resetCount, 'elements');
    }


    // Control Show/Hide Methods
    showContentScalingControls() {
        const controls = document.getElementById('content-scaling-controls');
        if (controls) {
            controls.style.display = 'block';
        }
    }

    hideContentScalingControls() {
        const controls = document.getElementById('content-scaling-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }

    showFontSizingControls() {
        const controls = document.getElementById('font-sizing-controls');
        if (controls) {
            controls.style.display = 'block';
        }
    }

    hideFontSizingControls() {
        const controls = document.getElementById('font-sizing-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }



    // Reset Methods
    resetContentScale() {
        this.contentScale = 100; // Reset to 100% (normal size)
        
        // Reset body scaling
        const body = document.body;
        const html = document.documentElement;
        
        body.style.transform = '';
        body.style.transformOrigin = '';
        body.style.width = '';
        body.style.height = '';
        body.style.position = '';
        body.style.left = '';
        body.style.top = '';
        
        // Reset accessibility widget container
        const widgetContainer = document.getElementById('accessibility-widget-container');
        if (widgetContainer) {
            widgetContainer.style.transform = '';
            widgetContainer.style.transformOrigin = '';
        }
        
        // Reset accessibility widget elements
        const accessibilityElements = document.querySelectorAll('.accessibility-panel, #accessibility-icon, .accessibility-icon');
        accessibilityElements.forEach(element => {
            element.style.transform = '';
            element.style.transformOrigin = '';
        });
        
        // Reset container overflow restrictions
        html.style.overflow = '';
        html.style.maxWidth = '';
        html.style.maxHeight = '';
        
        this.updateContentScaleDisplay();
        console.log('Accessibility Widget: Content scale reset to 100%');
    }

    // Highlight Methods
    highlightTitles() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            // Skip if heading is inside accessibility panel
            if (heading.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                return;
            }
            
            // Create a wrapper div around the heading
            if (!heading.dataset.highlighted) {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    display: inline-block;
                    border: 2px solid #6366f1;
                    border-radius: 6px;
                    padding: 4px 8px;
                    margin: 2px;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                    background: transparent;
                `;
                
                // Insert wrapper before heading and move heading inside
                heading.parentNode.insertBefore(wrapper, heading);
                wrapper.appendChild(heading);
                heading.dataset.highlighted = 'true';
            }
        });
    }

    removeTitleHighlights() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            // Remove wrapper if it exists
            if (heading.dataset.highlighted && heading.parentNode && heading.parentNode.style.border) {
                const wrapper = heading.parentNode;
                const grandParent = wrapper.parentNode;
                grandParent.insertBefore(heading, wrapper);
                grandParent.removeChild(wrapper);
                delete heading.dataset.highlighted;
            }
        });
    }

    highlightLinks() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            // Create a wrapper div around the link
            if (!link.dataset.highlighted) {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    display: inline-block;
                    border: 2px solid #6366f1;
                    border-radius: 4px;
                    padding: 2px 4px;
                    margin: 1px;
                    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
                    background: transparent;
                `;
                
                // Insert wrapper before link and move link inside
                link.parentNode.insertBefore(wrapper, link);
                wrapper.appendChild(link);
                link.dataset.highlighted = 'true';
            }
        });
    }

    removeLinkHighlights() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            // Remove wrapper if it exists
            if (link.dataset.highlighted && link.parentNode && link.parentNode.style.border) {
                const wrapper = link.parentNode;
                const grandParent = wrapper.parentNode;
                grandParent.insertBefore(link, wrapper);
                grandParent.removeChild(wrapper);
                delete link.dataset.highlighted;
            }
        });
    }

    showColorPicker(type) {
        const color = prompt(`Enter ${type} color (hex code):`, '#000000');
        if (color) {
            document.documentElement.style.setProperty(`--custom-${type}-color`, color);
            document.body.classList.add(`custom-${type}-color`);
        }
    }

    // Useful Links Methods
    enableUsefulLinks() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#useful-links');
        if (toggle) {
            toggle.checked = true;
        }
        
        this.createUsefulLinksDropdown();
        console.log('Accessibility Widget: Useful links enabled');
    }

    disableUsefulLinks() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#useful-links');
        if (toggle) {
            toggle.checked = false;
        }
        
        this.removeUsefulLinksDropdown();
        console.log('Accessibility Widget: Useful links disabled');
    }

    createUsefulLinksDropdown() {
        // Remove existing dropdown if any
        this.removeUsefulLinksDropdown();
        
        // Find the useful-links module in the panel
        const usefulLinksToggle = this.shadowRoot.querySelector('#useful-links');
        console.log('Accessibility Widget: Found useful-links toggle:', usefulLinksToggle);
        
        if (!usefulLinksToggle) {
            console.error('Accessibility Widget: Could not find #useful-links toggle');
            return;
        }
        
        const usefulLinksModule = usefulLinksToggle.closest('.profile-item');
        console.log('Accessibility Widget: Found useful-links module:', usefulLinksModule);
        
        if (usefulLinksModule) {
            // Create dropdown content
            const dropdownContainer = document.createElement('div');
            dropdownContainer.id = 'useful-links-dropdown';
            dropdownContainer.className = 'useful-links-dropdown';
            
            // Create dropdown content
            dropdownContainer.innerHTML = `
                <div class="useful-links-content">
                    <select id="useful-links-select">
                        <option value="">Select an option</option>
                        <option value="home">Home</option>
                        <option value="header">Header</option>
                        <option value="footer">Footer</option>
                        <option value="main-content">Main content</option>
                        <option value="about-us">About us</option>
                        <option value="portfolio">Portfolio</option>
                    </select>
                </div>
            `;
            
            // Insert the dropdown INSIDE the profile-item, after the profile-info
            const profileInfo = usefulLinksModule.querySelector('.profile-info');
            const toggleSwitch = usefulLinksModule.querySelector('.toggle-switch');
            
            // Add class to profile-item to indicate dropdown is present
            usefulLinksModule.classList.add('has-dropdown');
            
            // Force block layout with inline styles to override any CSS
            usefulLinksModule.style.display = 'block';
            usefulLinksModule.style.flexDirection = 'unset';
            usefulLinksModule.style.alignItems = 'unset';
            usefulLinksModule.style.justifyContent = 'unset';
            usefulLinksModule.style.flexWrap = 'unset';
            usefulLinksModule.style.flexFlow = 'unset';
            usefulLinksModule.style.flex = 'unset';
            
            // Move toggle inside profile-info to keep them together
            profileInfo.appendChild(toggleSwitch);
            
            // Insert dropdown after profile-info
            profileInfo.parentNode.insertBefore(dropdownContainer, profileInfo.nextSibling);
            
            // Add event listener to select
            const select = dropdownContainer.querySelector('#useful-links-select');
            select.addEventListener('change', (e) => {
                const value = e.target.value;
                if (value) {
                    this.navigateToSection(value);
                    // Reset to default option
                    e.target.value = '';
                }
            });
            
            console.log('Accessibility Widget: Useful links dropdown created in panel');
        } else {
            console.error('Accessibility Widget: Could not find useful-links module');
        }
    }

    removeUsefulLinksDropdown() {
        const dropdown = this.shadowRoot.querySelector('#useful-links-dropdown');
        if (dropdown) {
            dropdown.remove();
            
            // Restore original structure
            const usefulLinksModule = this.shadowRoot.querySelector('#useful-links').closest('.profile-item');
            if (usefulLinksModule) {
                usefulLinksModule.classList.remove('has-dropdown');
                
                // Clear inline styles to restore original CSS
                usefulLinksModule.style.display = '';
                usefulLinksModule.style.flexDirection = '';
                usefulLinksModule.style.alignItems = '';
                usefulLinksModule.style.justifyContent = '';
                usefulLinksModule.style.flexWrap = '';
                usefulLinksModule.style.flexFlow = '';
                usefulLinksModule.style.flex = '';
                
                // Move toggle back to its original position
                const profileInfo = usefulLinksModule.querySelector('.profile-info');
                const toggleSwitch = profileInfo.querySelector('.toggle-switch');
                if (toggleSwitch) {
                    // Remove toggle from profile-info
                    toggleSwitch.remove();
                    // Add toggle back to profile-item
                    usefulLinksModule.appendChild(toggleSwitch);
                }
            }
            console.log('Accessibility Widget: Useful links dropdown removed');
        }
    }

    navigateToSection(section) {
        console.log('Accessibility Widget: Navigating to section:', section);
        
        switch(section) {
            case 'home':
                this.scrollToElement('body');
                break;
            case 'header':
                this.scrollToElement('header, .header, nav, .navbar');
                break;
            case 'footer':
                this.scrollToElement('footer, .footer');
                break;
            case 'main-content':
                this.scrollToElement('main, .main, .content, .container');
                break;
            case 'about-us':
                this.scrollToElement('[id*="about"], [class*="about"], h1:contains("About"), h2:contains("About")');
                break;
            case 'portfolio':
                this.scrollToElement('[id*="portfolio"], [class*="portfolio"], h1:contains("Portfolio"), h2:contains("Portfolio")');
                break;
            default:
                console.log('Accessibility Widget: Unknown section:', section);
        }
    }

    scrollToElement(selector) {
        // Try multiple selectors
        const selectors = selector.split(', ');
        let element = null;
        
        for (const sel of selectors) {
            if (sel.includes(':contains')) {
                // Handle text content search
                const text = sel.match(/:contains\("([^"]+)"\)/)[1];
                element = this.findElementByText(text);
            } else {
                element = document.querySelector(sel);
            }
            
            if (element) break;
        }
        
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
            console.log('Accessibility Widget: Scrolled to element:', element);
        } else {
            console.log('Accessibility Widget: Element not found for selector:', selector);
        }
    }

    findElementByText(text) {
        // Search for elements containing the text
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, section, article');
        for (const element of elements) {
            if (element.textContent.toLowerCase().includes(text.toLowerCase())) {
                return element;
            }
        }
        return null;
    }

    // Reading Mask Methods
    enableReadingMask() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#reading-mask');
        if (toggle) {
            toggle.checked = true;
        }
        
        document.body.classList.add('reading-mask');
        this.createReadingMaskSpotlight();
        console.log('Accessibility Widget: Reading mask enabled');
    }

    disableReadingMask() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#reading-mask');
        if (toggle) {
            toggle.checked = false;
        }
        
        // Remove reading-mask class from body
        document.body.classList.remove('reading-mask');
        console.log('Accessibility Widget: Reading mask class removed from body');
        
        // Remove spotlight
        this.removeReadingMaskSpotlight();
        
        // Force remove any remaining reading-mask elements
        const spotlightContainer = document.getElementById('reading-mask-spotlight-container');
        if (spotlightContainer) {
            spotlightContainer.remove();
            console.log('Accessibility Widget: Spotlight container force removed');
        }
        
        // Remove any remaining ::before pseudo-elements by forcing a reflow
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Also remove from html element in case it was added there
        document.documentElement.classList.remove('reading-mask');
        
        // Force remove any inline styles that might be causing issues
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.style.filter && element.style.filter.includes('brightness')) {
                element.style.filter = '';
            }
            if (element.style.backdropFilter && element.style.backdropFilter.includes('brightness')) {
                element.style.backdropFilter = '';
            }
        });
        
        console.log('Accessibility Widget: Reading mask disabled');
    }

    createReadingMaskSpotlight() {
        // Remove existing spotlight if any
        this.removeReadingMaskSpotlight();
        
        // Create spotlight container
        const spotlightContainer = document.createElement('div');
        spotlightContainer.id = 'reading-mask-spotlight-container';
        spotlightContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 100001;
            overflow: hidden;
        `;
        document.body.appendChild(spotlightContainer);
        
        // Create spotlight overlay with enhanced brightness for reading
        const spotlight = document.createElement('div');
        spotlight.id = 'reading-mask-spotlight';
        spotlight.style.cssText = `
            position: absolute;
            width: 100%;
            height: 150px;
            background: transparent;
            backdrop-filter: brightness(2.2) contrast(1.2);
            box-shadow: 
                inset 0 0 50px rgba(255, 255, 255, 0.2),
                0 0 20px rgba(255, 255, 255, 0.1);
            border-top: 2px solid rgba(255, 255, 255, 0.4);
            border-bottom: 2px solid rgba(255, 255, 255, 0.4);
            transform: translateY(-50%);
            transition: none;
            border-radius: 8px;
            filter: none;
        `;
        spotlightContainer.appendChild(spotlight);
        
        // Add mouse move event listener
        this.readingMaskMouseMoveHandler = (e) => {
            const y = e.clientY - 75; // Center the spotlight on cursor (half of 150px height)
            
            // Keep spotlight within viewport bounds
            const maxY = window.innerHeight - 150;
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            spotlight.style.top = clampedY + 'px';
            spotlight.style.transition = 'top 0.1s ease-out';
        };
        
        document.addEventListener('mousemove', this.readingMaskMouseMoveHandler);
        
        console.log('Accessibility Widget: Reading mask spotlight created');
    }

    removeReadingMaskSpotlight() {
        const spotlightContainer = document.getElementById('reading-mask-spotlight-container');
        if (spotlightContainer) {
            spotlightContainer.remove();
        }
        
        // Remove mouse move event listener
        if (this.readingMaskMouseMoveHandler) {
            document.removeEventListener('mousemove', this.readingMaskMouseMoveHandler);
            this.readingMaskMouseMoveHandler = null;
        }
        
        console.log('Accessibility Widget: Reading mask spotlight removed');
    }

    // Highlight Hover Methods
    enableHighlightHover() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-hover');
        if (toggle) {
            toggle.checked = true;
        }
        
        this.addHoverHighlights();
        console.log('Accessibility Widget: Highlight hover enabled');
    }

    disableHighlightHover() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-hover');
        if (toggle) {
            toggle.checked = false;
        }
        
        this.removeHoverHighlights();
        console.log('Accessibility Widget: Highlight hover disabled');
    }

    addHoverHighlights() {
        // Select all interactive and important elements
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, .logo, .nav-logo, .menu, .nav-item, .navbar, nav, header, .header, .btn, input, textarea, select, label, li, td, th, [role="button"], [role="link"], [role="menuitem"]');
        
        elements.forEach(element => {
            // Skip accessibility widget elements
            if (element.closest('.accessibility-panel') || element.closest('#accessibility-icon')) {
                return;
            }
            
            // Add hover event listeners
            element.addEventListener('mouseenter', (e) => {
                // Add highlight box only - no background changes
                element.style.outline = '2px solid #6366f1';
                element.style.outlineOffset = '2px';
                element.style.borderRadius = '4px';
                element.style.transition = 'outline 0.2s ease';
                // Don't touch background or color at all
            });
            
            element.addEventListener('mouseleave', (e) => {
                // Remove highlight box only
                element.style.outline = '';
                element.style.outlineOffset = '';
                element.style.borderRadius = '';
                element.style.transition = '';
                // Don't reset anything else
            });
        });
        
        console.log('Accessibility Widget: Hover highlights added to', elements.length, 'elements');
    }

    removeHoverHighlights() {
        // Select all elements that might have highlights
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, .logo, .nav-logo, .menu, .nav-item, .navbar, nav, header, .header, .btn, input, textarea, select, label, li, td, th, [role="button"], [role="link"], [role="menuitem"]');
        
        elements.forEach(element => {
            // Skip accessibility widget elements
            if (element.closest('.accessibility-panel') || element.closest('#accessibility-icon')) {
                return;
            }
            
            // Remove highlight styles
            element.style.outline = '';
            element.style.outlineOffset = '';
            element.style.borderRadius = '';
            element.style.transition = '';
            
            // Remove event listeners by cloning and replacing
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        });
        
        console.log('Accessibility Widget: Hover highlights removed from', elements.length, 'elements');
    }

    // Highlight Focus Methods
    enableHighlightFocus() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-focus');
        if (toggle) {
            toggle.checked = true;
        }
        
        document.body.classList.add('highlight-focus');
        console.log('Accessibility Widget: Highlight focus enabled');
    }

    disableHighlightFocus() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-focus');
        if (toggle) {
            toggle.checked = false;
        }
        
        document.body.classList.remove('highlight-focus');
        console.log('Accessibility Widget: Highlight focus disabled');
    }

    showStatement() {
        alert('This website is committed to providing an accessible experience for all users. We follow WCAG 2.1 guidelines and continuously work to improve accessibility.');
    }

    resetSettings() {
        this.settings = {};
        this.saveSettings();
        this.applySettings();
        
        // Remove all accessibility classes
        const body = document.body;
        const classes = body.className.split(' ').filter(cls => 
            !cls.includes('-') || cls.includes('accessibility')
        );
        body.className = classes.join(' ');
        
        // Reset scaling values
        this.contentScale = 100; // Reset to 100% (normal size)
        this.fontSize = 100;
        this.lineHeight = 100;
        this.letterSpacing = 100;
        
        // Reset font size
        this.resetFontSize();
        
        // Reset content scale
        this.resetContentScale();
        
        // Reset line height
        this.resetLineHeight();
        

        
        // Reset letter spacing
        this.resetLetterSpacing();
        
        // Disable text magnifier
        this.disableTextMagnifier();
        
        // Remove font size controls
        this.disableFontSizing();
        
                // Hide all scaling controls
        this.hideContentScalingControls();
        this.hideFontSizingControls();
        this.hideLineHeightControls();
        this.hideLetterSpacingControls();
        
        // Remove highlights
        this.removeTitleHighlights();
        this.removeLinkHighlights();
        
        // Disable high contrast and saturation
        this.disableHighContrast();
        this.disableHighSaturation();
        this.disableDarkContrast();
        this.disableLightContrast();
        
        // Reset text colors
        this.resetTextColors();
        this.hideTextColorPicker();
        this.resetTitleColors();
        this.hideTitleColorPicker();
        this.resetBackgroundColors();
        this.hideBackgroundColorPicker();
        
        // Disable all profiles
        this.disableSeizureSafe();
        this.disableVisionImpaired();
        this.disableADHDFriendly();
        this.disableCognitiveDisability();
        this.disableReadableFont();
        
        // Remove cognitive boxes
        this.removeCognitiveBoxes();
        
        // Remove ADHD spotlight
        this.removeADHDSpotlight();
        
        // Reset custom colors
        document.documentElement.style.removeProperty('--custom-text-color');
        document.documentElement.style.removeProperty('--custom-title-color');
        document.documentElement.style.removeProperty('--custom-bg-color');
        
        // Reset all toggles in Shadow DOM
        const toggles = this.shadowRoot.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.checked = false;
        });
        
        // Update widget appearance after reset
        this.updateWidgetAppearance();
    }

    loadSettings() {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
        
        // Set default settings for keyboard navigation if not already set
        if (this.settings['keyboard-nav'] === undefined) {
            this.settings['keyboard-nav'] = true; // Enable by default
            console.log('Accessibility Widget: Setting keyboard navigation to enabled by default');
        }
        
        // Force enable keyboard navigation for testing
        this.settings['keyboard-nav'] = true;
        console.log('Accessibility Widget: Forcing keyboard navigation to enabled');
        
        // Ensure line height is always initialized to 100%
        this.lineHeight = 100;
        console.log('Accessibility Widget: Line height initialized to 100%');
        

        
        console.log('Accessibility Widget: Loaded settings:', this.settings);
    }

    saveSettings() {
        localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
    }

    applySettings() {
        console.log('Accessibility Widget: Applying settings:', this.settings);
        
        Object.entries(this.settings).forEach(([feature, enabled]) => {
            console.log(`Accessibility Widget: Processing feature ${feature}: ${enabled}`);
            if (enabled) {
                this.applyFeature(feature, true);
                const toggle = this.shadowRoot.getElementById(feature);
                if (toggle) toggle.checked = true;
            }
        });
        
        // Initialize keyboard shortcuts if keyboard navigation is enabled
        if (this.settings['keyboard-nav']) {
            console.log('Accessibility Widget: Keyboard navigation enabled in settings, initializing shortcuts');
            this.initKeyboardShortcuts();
        } else {
            console.log('Accessibility Widget: Keyboard navigation not enabled in settings');
            console.log('Accessibility Widget: Available settings keys:', Object.keys(this.settings));
        }
        
        // Update widget appearance to sync with loaded settings
        this.updateWidgetAppearance();
    }

    // Add missing letter spacing control methods
    showLetterSpacingControls() {
        console.log('Accessibility Widget: showLetterSpacingControls called');
        const controls = this.shadowRoot.getElementById('letter-spacing-controls');
        if (controls) {
            controls.style.display = 'block';
            console.log('Accessibility Widget: Letter spacing controls shown');
        } else {
            console.error('Accessibility Widget: Letter spacing controls not found');
        }
    }

    hideLetterSpacingControls() {
        const controls = this.shadowRoot.getElementById('letter-spacing-controls');
        if (controls) {
            controls.style.display = 'none';
            console.log('Accessibility Widget: Letter spacing controls hidden');
        } else {
            console.error('Accessibility Widget: Letter spacing controls not found');
        }
    }

    // High Contrast Methods
    enableHighContrast() {
        console.log('Accessibility Widget: enableHighContrast called');
        document.body.classList.add('high-contrast');
        console.log('Accessibility Widget: High contrast enabled');
    }

    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        console.log('Accessibility Widget: High contrast disabled');
    }

    // High Saturation Methods
    enableHighSaturation() {
        document.body.classList.add('high-saturation');
        console.log('Accessibility Widget: High saturation enabled');
    }

    disableHighSaturation() {
        document.body.classList.remove('high-saturation');
        console.log('Accessibility Widget: High saturation disabled');
    }

    // Monochrome Methods
    enableMonochrome() {
        document.body.classList.add('monochrome');
        console.log('Accessibility Widget: Monochrome enabled');
    }

    disableMonochrome() {
        document.body.classList.remove('monochrome');
        console.log('Accessibility Widget: Monochrome disabled');
    }

    // Dark Contrast Methods
    enableDarkContrast() {
        console.log('Accessibility Widget: enableDarkContrast called');
        document.body.classList.add('dark-contrast');
        console.log('Accessibility Widget: Dark contrast enabled');
    }

    disableDarkContrast() {
        document.body.classList.remove('dark-contrast');
        console.log('Accessibility Widget: Dark contrast disabled');
    }

    // Light Contrast Methods
    enableLightContrast() {
        console.log('Accessibility Widget: enableLightContrast called');
        document.body.classList.add('light-contrast');
        console.log('Accessibility Widget: Light contrast enabled');
    }

    disableLightContrast() {
        document.body.classList.remove('light-contrast');
        console.log('Accessibility Widget: Light contrast disabled');
    }

    // Text Color Picker Methods
    showTextColorPicker() {
        console.log('Accessibility Widget: showTextColorPicker called');
        
        // Remove existing color picker if any
        this.hideTextColorPicker();
        
        // Find the adjust-text-colors module in the panel
        const textColorsModule = this.shadowRoot.querySelector('#adjust-text-colors').closest('.profile-item');
        
        if (textColorsModule) {
            // Create color picker content
            const colorPicker = document.createElement('div');
            colorPicker.id = 'text-color-picker';
            colorPicker.className = 'color-picker-inline';
            colorPicker.innerHTML = `
                <div class="color-picker-content">
                    <h4>Adjust Text Colors</h4>
                    <div class="color-options">
                        <div class="color-option" data-color="#3b82f6" style="background-color: #3b82f6;"></div>
                        <div class="color-option selected" data-color="#8b5cf6" style="background-color: #8b5cf6;"></div>
                        <div class="color-option" data-color="#ef4444" style="background-color: #ef4444;"></div>
                        <div class="color-option" data-color="#f97316" style="background-color: #f97316;"></div>
                        <div class="color-option" data-color="#14b8a6" style="background-color: #14b8a6;"></div>
                        <div class="color-option" data-color="#84cc16" style="background-color: #84cc16;"></div>
                        <div class="color-option" data-color="#ffffff" style="background-color: #ffffff; border: 1px solid #ccc;"></div>
                        <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                    </div>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;
            
            // Insert after the profile-info div, before the toggle switch
            const profileInfo = textColorsModule.querySelector('.profile-info');
            const toggleSwitch = textColorsModule.querySelector('.toggle-switch');
            textColorsModule.insertBefore(colorPicker, toggleSwitch);
            
            // Add event listeners to color options
            const colorOptions = colorPicker.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const color = e.target.dataset.color;
                    this.applyTextColor(color);
                    
                    // Update selected state
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    e.target.classList.add('selected');
                });
            });
            
            // Add event listener to cancel button
            const cancelBtn = colorPicker.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.resetTextColors();
                    this.hideTextColorPicker();
                    // Turn off the toggle switch
                    const toggle = this.shadowRoot.querySelector('#adjust-text-colors');
                    if (toggle) {
                        toggle.checked = false;
                        this.handleToggle('adjust-text-colors', false);
                    }
                });
            }
            
            console.log('Accessibility Widget: Text color picker shown in panel');
        } else {
            console.error('Accessibility Widget: Could not find adjust-text-colors module');
        }
    }

    hideTextColorPicker() {
        const colorPicker = this.shadowRoot.getElementById('text-color-picker');
        if (colorPicker) {
            colorPicker.remove();
            console.log('Accessibility Widget: Text color picker hidden');
        }
    }

    applyTextColor(color) {
        console.log('Accessibility Widget: Applying text color:', color);
        
        // Apply color to all text elements except buttons, headings, and links
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b');
        
        textElements.forEach(element => {
            // Skip if element is inside a button, heading, link, or accessibility panel
            if (!element.closest('button, h1, h2, h3, h4, h5, h6, a, .btn, .accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.color = color;
            }
        });
        
        // Apply color to menu text specifically (but not accessibility panel menu)
        const menuElements = document.querySelectorAll('.nav-menu li a, .navbar a, nav a, .menu a, .nav-item a');
        menuElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.color = color;
            }
        });
        
        // Store the selected color
        this.selectedTextColor = color;
        console.log('Accessibility Widget: Text color applied to elements (excluding accessibility panel)');
    }

    resetTextColors() {
        console.log('Accessibility Widget: Resetting text colors');
        
        // Remove custom text colors
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b');
        textElements.forEach(element => {
            if (!element.closest('button, h1, h2, h3, h4, h5, h6, a, .btn, .accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.color = '';
            }
        });
        
        // Reset menu colors (but not accessibility panel menu)
        const menuElements = document.querySelectorAll('.nav-menu li a, .navbar a, nav a, .menu a, .nav-item a');
        menuElements.forEach(element => {
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.color = '';
            }
        });
        
        this.selectedTextColor = null;
        console.log('Accessibility Widget: Text colors reset (excluding accessibility panel)');
    }

    // Title Color Picker Methods
    showTitleColorPicker() {
        console.log('Accessibility Widget: showTitleColorPicker called');
        
        // Remove existing color picker if any
        this.hideTitleColorPicker();
        
        // Find the adjust-title-colors module in the panel
        const titleColorsModule = this.shadowRoot.querySelector('#adjust-title-colors').closest('.profile-item');
        
        if (titleColorsModule) {
            // Create color picker content
            const colorPicker = document.createElement('div');
            colorPicker.id = 'title-color-picker';
            colorPicker.className = 'color-picker-inline';
            colorPicker.innerHTML = `
                <div class="color-picker-content">
                    <h4>Adjust Title Colors</h4>
                    <div class="color-options">
                        <div class="color-option" data-color="#3b82f6" style="background-color: #3b82f6;"></div>
                        <div class="color-option" data-color="#8b5cf6" style="background-color: #8b5cf6;"></div>
                        <div class="color-option" data-color="#ef4444" style="background-color: #ef4444;"></div>
                        <div class="color-option selected" data-color="#f97316" style="background-color: #f97316;"></div>
                        <div class="color-option" data-color="#14b8a6" style="background-color: #14b8a6;"></div>
                        <div class="color-option" data-color="#84cc16" style="background-color: #84cc16;"></div>
                        <div class="color-option" data-color="#ffffff" style="background-color: #ffffff; border: 1px solid #ccc;"></div>
                        <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                    </div>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;
            
            // Insert after the profile-info div, before the toggle switch
            const profileInfo = titleColorsModule.querySelector('.profile-info');
            const toggleSwitch = titleColorsModule.querySelector('.toggle-switch');
            titleColorsModule.insertBefore(colorPicker, toggleSwitch);
            
            // Add event listeners to color options
            const colorOptions = colorPicker.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const color = e.target.dataset.color;
                    this.applyTitleColor(color);
                    
                    // Update selected state
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    e.target.classList.add('selected');
                });
            });
            
            // Add event listener to cancel button
            const cancelBtn = colorPicker.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.resetTitleColors();
                    this.hideTitleColorPicker();
                    // Turn off the toggle switch
                    const toggle = this.shadowRoot.querySelector('#adjust-title-colors');
                    if (toggle) {
                        toggle.checked = false;
                        this.handleToggle('adjust-title-colors', false);
                    }
                });
            }
            
            console.log('Accessibility Widget: Title color picker shown in panel');
        } else {
            console.error('Accessibility Widget: Could not find adjust-title-colors module');
        }
    }

    hideTitleColorPicker() {
        const colorPicker = this.shadowRoot.getElementById('title-color-picker');
        if (colorPicker) {
            colorPicker.remove();
            console.log('Accessibility Widget: Title color picker hidden');
        }
    }

    applyTitleColor(color) {
        console.log('Accessibility Widget: Applying title color:', color);
        
        // Apply color to all heading elements except accessibility panel
        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headingElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.color = color;
            }
        });
        
        // Store the selected color
        this.selectedTitleColor = color;
        console.log('Accessibility Widget: Title color applied to', headingElements.length, 'elements (excluding accessibility panel)');
    }

    resetTitleColors() {
        console.log('Accessibility Widget: Resetting title colors');
        
        // Remove custom title colors
        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingElements.forEach(element => {
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.color = '';
            }
        });
        
        this.selectedTitleColor = null;
        console.log('Accessibility Widget: Title colors reset (excluding accessibility panel)');
    }

    // Background Color Picker Methods
    showBackgroundColorPicker() {
        console.log('Accessibility Widget: showBackgroundColorPicker called');
        
        // Remove existing color picker if any
        this.hideBackgroundColorPicker();
        
        // Find the adjust-bg-colors module in the panel
        const bgColorsModule = this.shadowRoot.querySelector('#adjust-bg-colors').closest('.profile-item');
        
        if (bgColorsModule) {
            // Create color picker content
            const colorPicker = document.createElement('div');
            colorPicker.id = 'bg-color-picker';
            colorPicker.className = 'color-picker-inline';
            colorPicker.innerHTML = `
                <div class="color-picker-content">
                    <h4>Adjust Background Colors</h4>
                    <div class="color-options">
                        <div class="color-option" data-color="#3b82f6" style="background-color: #3b82f6;"></div>
                        <div class="color-option" data-color="#8b5cf6" style="background-color: #8b5cf6;"></div>
                        <div class="color-option" data-color="#ef4444" style="background-color: #ef4444;"></div>
                        <div class="color-option selected" data-color="#f97316" style="background-color: #f97316;"></div>
                        <div class="color-option" data-color="#14b8a6" style="background-color: #14b8a6;"></div>
                        <div class="color-option" data-color="#84cc16" style="background-color: #84cc16;"></div>
                        <div class="color-option" data-color="#ffffff" style="background-color: #ffffff; border: 1px solid #ccc;"></div>
                        <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
                    </div>
                    <button class="cancel-btn" onclick="accessibilityWidget.hideBackgroundColorPicker()">Cancel</button>
                </div>
            `;
            
            // Insert after the profile-info div, before the toggle switch
            const profileInfo = bgColorsModule.querySelector('.profile-info');
            const toggleSwitch = bgColorsModule.querySelector('.toggle-switch');
            bgColorsModule.insertBefore(colorPicker, toggleSwitch);
            
            // Add event listeners to color options
            const colorOptions = colorPicker.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    const color = e.target.dataset.color;
                    this.applyBackgroundColor(color);
                    
                    // Update selected state
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    e.target.classList.add('selected');
                });
            });
            
            // Add event listener to cancel button
            const cancelBtn = colorPicker.querySelector('.cancel-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.resetBackgroundColors();
                    this.hideBackgroundColorPicker();
                    // Turn off the toggle switch
                    const toggle = this.shadowRoot.querySelector('#adjust-bg-colors');
                    if (toggle) {
                        toggle.checked = false;
                        this.handleToggle('adjust-bg-colors', false);
                    }
                });
            }
            
            console.log('Accessibility Widget: Background color picker shown in panel');
        } else {
            console.error('Accessibility Widget: Could not find adjust-bg-colors module');
        }
    }

    hideBackgroundColorPicker() {
        const colorPicker = this.shadowRoot.getElementById('bg-color-picker');
        if (colorPicker) {
            colorPicker.remove();
            console.log('Accessibility Widget: Background color picker hidden');
        }
    }

    applyBackgroundColor(color) {
        console.log('Accessibility Widget: Applying background color:', color);
        
        // Apply background color only to specific content areas, not the entire page
        const mainContentAreas = document.querySelectorAll('section, article, main, .container, .hero, .about, .services, .test-section, .hero-content, .about-content, .services-grid, .service-card, .test-block, .contact-form, .contact-info');
        
        mainContentAreas.forEach(element => {
            // Skip accessibility panel elements
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                // Apply background color to specific content areas only
                element.style.backgroundColor = color;
            }
        });
        
        // Also apply to any remaining elements that might have backgrounds
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            // Skip accessibility panel elements and elements that already have the color
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon') && 
                element.style.backgroundColor !== color) {
                
                // Check if element has a background that's not transparent
                const computedStyle = window.getComputedStyle(element);
                const bgColor = computedStyle.backgroundColor;
                
                // If element has a background that's not transparent, apply our color
                if (bgColor !== 'rgba(0, 0, 0, 0)' && 
                    bgColor !== 'transparent' && 
                    bgColor !== color &&
                    !element.classList.contains('color-option') && // Don't change color picker colors
                    !element.classList.contains('cancel-btn')) { // Don't change button colors
                    element.style.backgroundColor = color;
                }
            }
        });
        
        // Store the selected color
        this.selectedBackgroundColor = color;
        console.log('Accessibility Widget: Background color applied to entire website');
    }

    resetBackgroundColors() {
        console.log('Accessibility Widget: Resetting background colors');
        
        // Reset html and body background
        document.documentElement.style.backgroundColor = '';
        document.body.style.backgroundColor = '';
        
        // Reset all main content areas
        const mainContentAreas = document.querySelectorAll('html, body, div, section, article, main, aside, header, footer, nav, .container, .hero, .about, .services, .test-section, .hero-content, .about-content, .services-grid, .service-card, .test-block');
        
        mainContentAreas.forEach(element => {
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                element.style.backgroundColor = '';
            }
        });
        
        // Reset all other elements that might have been changed
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon') &&
                !element.classList.contains('color-option') && 
                !element.classList.contains('cancel-btn')) {
                // Reset if we applied a background color to it
                if (element.style.backgroundColor && element.style.backgroundColor !== '') {
                    element.style.backgroundColor = '';
                }
            }
        });
        
        this.selectedBackgroundColor = null;
        console.log('Accessibility Widget: Background colors reset for entire website');
    }

    // Mute Sound Methods
    enableMuteSound() {
        console.log('Accessibility Widget: Mute sound enabled');
        
        // Find all audio and video elements
        const audioElements = document.querySelectorAll('audio');
        const videoElements = document.querySelectorAll('video');
        
        // Store original volume and set volume to 0 (allows playback but no sound)
        this.originalVolumeStates = new Map();
        
        audioElements.forEach((element, index) => {
            this.originalVolumeStates.set(`audio-${index}`, element.volume);
            element.volume = 0;
        });
        
        videoElements.forEach((element, index) => {
            this.originalVolumeStates.set(`video-${index}`, element.volume);
            element.volume = 0;
        });
        
        console.log(`Accessibility Widget: Set volume to 0 for ${audioElements.length} audio and ${videoElements.length} video elements`);
    }

    disableMuteSound() {
        console.log('Accessibility Widget: Mute sound disabled');
        
        // Restore original volume states
        if (this.originalVolumeStates) {
            const audioElements = document.querySelectorAll('audio');
            const videoElements = document.querySelectorAll('video');
            
            audioElements.forEach((element, index) => {
                const originalVolume = this.originalVolumeStates.get(`audio-${index}`);
                if (originalVolume !== undefined) {
                    element.volume = originalVolume;
                }
            });
            
            videoElements.forEach((element, index) => {
                const originalVolume = this.originalVolumeStates.get(`video-${index}`);
                if (originalVolume !== undefined) {
                    element.volume = originalVolume;
                }
            });
            
            this.originalVolumeStates.clear();
        }
        
        console.log('Accessibility Widget: Restored original audio/video volume states');
    }

    // Read Mode Methods
    enableReadMode() {
        console.log('Accessibility Widget: Read mode enabled');
        
        // Remove existing read mode if any
        this.disableReadMode();
        
        // Extract content from the website
        const content = this.extractTextContent();
        console.log('Read Mode: Extracted content length:', content.length);
        console.log('Read Mode: Extracted content preview:', content.substring(0, 200));
        
        // If no content was extracted, use fallback content
        const finalContent = content || '<div style="padding: 20px; color: #666; font-size: 1.1em;">No content could be extracted from this page.</div>';
        
        // Create overlay with extracted content
        const overlayHTML = `
            <div id="read-mode-overlay" style="
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: #e8f4f8 !important;
                z-index: 99997 !important;
                overflow-y: auto !important;
                padding: 20px !important;
                font-family: Arial, sans-serif !important;
                display: block !important;
            ">
                <div style="max-width: 800px; margin: 0 auto; padding-top: 60px;">
                    ${finalContent}
                </div>
            </div>
        `;
        
        // Insert the HTML directly into the body
        document.body.insertAdjacentHTML('beforeend', overlayHTML);
        
        // Verify the overlay was created
        const overlay = document.getElementById('read-mode-overlay');
        if (overlay) {
            console.log('Accessibility Widget: Read mode overlay successfully created and found in DOM');
            console.log('Accessibility Widget: Overlay z-index:', window.getComputedStyle(overlay).zIndex);
            console.log('Accessibility Widget: Overlay background:', window.getComputedStyle(overlay).backgroundColor);
        } else {
            console.error('Accessibility Widget: Read mode overlay was NOT created!');
        }
        
        console.log('Accessibility Widget: Read mode overlay created with direct HTML');
    }

    extractTextContent() {
        console.log('Read Mode: Starting content extraction...');
        
        let content = '';
        
        // Get all content elements in document order - focus on actual content elements
        const allElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, img, button');
        console.log('Read Mode: Found elements:', allElements.length);
        console.log('Read Mode: Document body:', document.body);
        console.log('Read Mode: Document ready state:', document.readyState);
        
        // Process elements in the order they appear on the page
        let processedCount = 0;
        allElements.forEach(element => {
            // Skip accessibility widget elements
            if (element.closest('.accessibility-panel') || element.closest('#accessibility-icon')) {
                console.log('Read Mode: Skipping accessibility widget element:', element);
                return;
            }
            
            const tagName = element.tagName.toLowerCase();
            const text = element.textContent.trim();
            console.log('Read Mode: Processing element:', tagName, 'text:', text.substring(0, 50));
            
            if (tagName.match(/^h[1-6]$/)) {
                // Headings
                if (text) {
                    const size = tagName === 'h1' ? '2.5em' : 
                               tagName === 'h2' ? '2em' : 
                               tagName === 'h3' ? '1.5em' : '1.2em';
                    content += `<div style="margin: 20px 0; font-size: ${size}; font-weight: bold; color: #333; line-height: 1.3;">${text}</div>`;
                    processedCount++;
                }
            } else if (tagName === 'p') {
                // Paragraphs
                if (text && text.length > 5) {
                    content += `<div style="margin: 15px 0; font-size: 1.1em; line-height: 1.6; color: #444;">${text}</div>`;
                    processedCount++;
                }
            } else if (tagName === 'a' && element.href) {
                // Links
                if (text) {
                    content += `<div style="margin: 10px 0; font-size: 1em; color: #0066cc; text-decoration: underline;">${text}</div>`;
                    processedCount++;
                }
            } else if (tagName === 'img' && element.src) {
                // Images
                const src = element.src;
                const alt = element.alt || '';
                content += `<div style="margin: 20px 0; text-align: center;">
                    <img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    ${alt ? `<div style="margin-top: 8px; font-size: 0.9em; color: #666; font-style: italic;">${alt}</div>` : ''}
                </div>`;
                processedCount++;
            } else if (tagName === 'button' && text) {
                // Buttons
                content += `<div style="margin: 10px 0; font-size: 1em; color: #333; font-weight: 500;">[Button] ${text}</div>`;
                processedCount++;
            }
        });
        
        // If no content was extracted, show a message
        if (!content) {
            content = '<div style="text-align: center; padding: 40px; color: #6b7280;">' +
                '<h2 style="color: #374151;">No readable content found</h2>' +
                '<p>This page may not have extractable text content.</p>' +
                '</div>';
        }
        
        console.log('Read Mode: Content extraction completed. Processed elements:', processedCount, 'Content length:', content.length);
        return content;
    }

    disableReadMode() {
        console.log('Accessibility Widget: Read mode disabled');
        
        const readModeOverlay = document.getElementById('read-mode-overlay');
        if (readModeOverlay) {
            readModeOverlay.remove();
            console.log('Accessibility Widget: Read mode overlay removed');
        } else {
            console.log('Accessibility Widget: No read mode overlay found to remove');
        }
        
        // Force a reflow to ensure the overlay is completely removed
        document.body.offsetHeight;
    }

    // Reading Guide Methods
    enableReadingGuide() {
        console.log('Accessibility Widget: Reading guide enabled');
        
        // Remove existing reading guide if any
        this.disableReadingGuide();
        
        // Add reading guide styles
        const style = document.createElement('style');
        style.id = 'reading-guide-styles';
        style.textContent = `
            .reading-guide {
                position: relative;
            }
            
            .reading-guide-active {
                cursor: none;
            }
            
            .reading-guide-bar {
                position: fixed;
                width: 200px;
                height: 4px;
                background: linear-gradient(90deg, rgba(99, 102, 241, 0.8), rgba(99, 102, 241, 0.4));
                border-radius: 2px;
                pointer-events: none;
                z-index: 100000;
                transition: all 0.1s ease;
                box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
            }
        `;
        document.head.appendChild(style);
        
        // Create reading guide bar
        const readingGuideBar = document.createElement('div');
        readingGuideBar.id = 'reading-guide-bar';
        readingGuideBar.className = 'reading-guide-bar';
        document.body.appendChild(readingGuideBar);
        
        // Add mouse move event listener
        this.readingGuideMouseMoveHandler = (e) => {
            const x = e.clientX - 100; // Center the bar on cursor (half of 200px width)
            const y = e.clientY - 2; // Center vertically (half of 4px height)
            
            // Keep bar within viewport bounds
            const maxX = window.innerWidth - 200;
            const maxY = window.innerHeight - 4;
            const clampedX = Math.max(0, Math.min(x, maxX));
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            readingGuideBar.style.left = clampedX + 'px';
            readingGuideBar.style.top = clampedY + 'px';
        };
        
        document.addEventListener('mousemove', this.readingGuideMouseMoveHandler);
        document.body.classList.add('reading-guide-active');
        
        console.log('Accessibility Widget: Reading guide bar created');
    }

    disableReadingGuide() {
        console.log('Accessibility Widget: Reading guide disabled');
        
        // Remove reading guide bar
        const readingGuideBar = document.getElementById('reading-guide-bar');
        if (readingGuideBar) {
            readingGuideBar.remove();
        }
        
        // Remove styles
        const style = document.getElementById('reading-guide-styles');
        if (style) {
            style.remove();
        }
        
        // Remove event listener
        if (this.readingGuideMouseMoveHandler) {
            document.removeEventListener('mousemove', this.readingGuideMouseMoveHandler);
            this.readingGuideMouseMoveHandler = null;
        }
        
        document.body.classList.remove('reading-guide-active');
        console.log('Accessibility Widget: Reading guide removed');
    }

    // Reading Mask Methods
    enableReadingMask() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#reading-mask');
        if (toggle) {
            toggle.checked = true;
        }
        
        document.body.classList.add('reading-mask');
        this.createReadingMaskSpotlight();
        console.log('Accessibility Widget: Reading mask enabled');
    }

    disableReadingMask() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#reading-mask');
        if (toggle) {
            toggle.checked = false;
        }
        
        // Remove reading-mask class from body
        document.body.classList.remove('reading-mask');
        console.log('Accessibility Widget: Reading mask class removed from body');
        
        // Remove spotlight
        this.removeReadingMaskSpotlight();
        
        // Force remove any remaining reading-mask elements
        const spotlightContainer = document.getElementById('reading-mask-spotlight-container');
        if (spotlightContainer) {
            spotlightContainer.remove();
            console.log('Accessibility Widget: Spotlight container force removed');
        }
        
        // Remove any remaining ::before pseudo-elements by forcing a reflow
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
        
        // Also remove from html element in case it was added there
        document.documentElement.classList.remove('reading-mask');
        
        // Force remove any inline styles that might be causing issues
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.style.filter && element.style.filter.includes('brightness')) {
                element.style.filter = '';
            }
            if (element.style.backdropFilter && element.style.backdropFilter.includes('brightness')) {
                element.style.backdropFilter = '';
            }
        });
        
        console.log('Accessibility Widget: Reading mask disabled');
    }

    createReadingMaskSpotlight() {
        // Remove existing spotlight if any
        this.removeReadingMaskSpotlight();
        
        // Create spotlight container
        const spotlightContainer = document.createElement('div');
        spotlightContainer.id = 'reading-mask-spotlight-container';
        spotlightContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 100001;
            overflow: hidden;
        `;
        document.body.appendChild(spotlightContainer);
        
        // Create spotlight overlay with enhanced brightness for reading
        const spotlight = document.createElement('div');
        spotlight.id = 'reading-mask-spotlight';
        spotlight.style.cssText = `
            position: absolute;
            width: 100%;
            height: 150px;
            background: transparent;
            backdrop-filter: brightness(2.2) contrast(1.2);
            box-shadow: 
                inset 0 0 50px rgba(255, 255, 255, 0.2),
                0 0 20px rgba(255, 255, 255, 0.1);
            border-top: 2px solid rgba(255, 255, 255, 0.4);
            border-bottom: 2px solid rgba(255, 255, 255, 0.4);
            transform: translateY(-50%);
            transition: none;
            border-radius: 8px;
            filter: none;
        `;
        spotlightContainer.appendChild(spotlight);
        
        // Add mouse move event listener
        this.readingMaskMouseMoveHandler = (e) => {
            const y = e.clientY - 75; // Center the spotlight on cursor (half of 150px height)
            // Keep spotlight within viewport bounds
            const maxY = window.innerHeight - 150;
            const clampedY = Math.max(0, Math.min(y, maxY));
            spotlight.style.top = clampedY + 'px';
            spotlight.style.transition = 'top 0.1s ease-out';
        };
        
        document.addEventListener('mousemove', this.readingMaskMouseMoveHandler);
        
        console.log('Accessibility Widget: Reading mask spotlight created');
    }

    removeReadingMaskSpotlight() {
        const spotlightContainer = document.getElementById('reading-mask-spotlight-container');
        if (spotlightContainer) {
            spotlightContainer.remove();
        }
        
        // Remove mouse move event listener
        if (this.readingMaskMouseMoveHandler) {
            document.removeEventListener('mousemove', this.readingMaskMouseMoveHandler);
            this.readingMaskMouseMoveHandler = null;
        }
        
        console.log('Accessibility Widget: Reading mask spotlight removed');
    }

    // Highlight Hover Methods
    enableHighlightHover() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-hover');
        if (toggle) {
            toggle.checked = true;
        }
        
        this.addHoverHighlights();
        console.log('Accessibility Widget: Highlight hover enabled');
    }

    disableHighlightHover() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-hover');
        if (toggle) {
            toggle.checked = false;
        }
        
        this.removeHoverHighlights();
        console.log('Accessibility Widget: Highlight hover disabled');
    }

    addHoverHighlights() {
        // Select all interactive and important elements
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, .logo, .nav-logo, .menu, .nav-item, .navbar, nav, header, .header, .btn, input, textarea, select, label, li, td, th, [role="button"], [role="link"], [role="menuitem"]');
        
        elements.forEach(element => {
            // Skip accessibility widget elements
            if (element.closest('.accessibility-panel') || element.closest('#accessibility-icon')) {
                return;
            }
            
            // Add hover event listeners
            element.addEventListener('mouseenter', (e) => {
                // Add highlight box only - no background changes
                element.style.outline = '2px solid #6366f1';
                element.style.outlineOffset = '2px';
                element.style.borderRadius = '4px';
                element.style.transition = 'outline 0.2s ease';
                // Don't touch background or color at all
            });
            
            element.addEventListener('mouseleave', (e) => {
                // Remove highlight box only
                element.style.outline = '';
                element.style.outlineOffset = '';
                element.style.borderRadius = '';
                element.style.transition = '';
                // Don't reset anything else
            });
        });
        
        console.log('Accessibility Widget: Hover highlights added to', elements.length, 'elements');
    }

    removeHoverHighlights() {
        // Select all elements that might have highlights
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, img, .logo, .nav-logo, .menu, .nav-item, .navbar, nav, header, .header, .btn, input, textarea, select, label, li, td, th, [role="button"], [role="link"], [role="menuitem"]');
        
        elements.forEach(element => {
            // Skip accessibility widget elements
            if (element.closest('.accessibility-panel') || element.closest('#accessibility-icon')) {
                return;
            }
            
            // Remove highlight styles
            element.style.outline = '';
            element.style.outlineOffset = '';
            element.style.borderRadius = '';
            element.style.transition = '';
            
            // Remove event listeners by cloning and replacing
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
        });
        
        console.log('Accessibility Widget: Hover highlights removed from', elements.length, 'elements');
    }

    // Highlight Focus Methods
    enableHighlightFocus() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-focus');
        if (toggle) {
            toggle.checked = true;
        }
        
        document.body.classList.add('highlight-focus');
        console.log('Accessibility Widget: Highlight focus enabled');
    }

    disableHighlightFocus() {
        // Update toggle state
        const toggle = this.shadowRoot.querySelector('#highlight-focus');
        if (toggle) {
            toggle.checked = false;
        }
        
        document.body.classList.remove('highlight-focus');
        console.log('Accessibility Widget: Highlight focus disabled');
    }

    showStatement() {
        alert('This website is committed to providing an accessible experience for all users. We follow WCAG 2.1 guidelines and continuously work to improve accessibility.');
    }

    resetSettings() {
        this.settings = {};
        this.saveSettings();
        this.applySettings();
        
        // Remove all accessibility classes
        const body = document.body;
        const classes = body.className.split(' ').filter(cls => 
            !cls.includes('-') || cls.includes('accessibility')
        );
        body.className = classes.join(' ');
        
        // Reset scaling values
        this.contentScale = 100; // Reset to 100% (normal size)
        this.fontSize = 100;
        this.lineHeight = 100;
        this.letterSpacing = 100;
        
        // Reset font size
        this.resetFontSize();
        
        // Reset content scale
        this.resetContentScale();
        
        // Reset line height
        this.resetLineHeight();
        
        // Reset letter spacing
        this.resetLetterSpacing();
        
        // Disable text magnifier
        this.disableTextMagnifier();
        
        // Remove font size controls
        this.disableFontSizing();
        
        // Hide all scaling controls
        this.hideContentScalingControls();
        this.hideFontSizingControls();
        this.hideLineHeightControls();
        this.hideLetterSpacingControls();
        
        // Remove highlights
        this.removeTitleHighlights();
        this.removeLinkHighlights();
        
        // Disable high contrast and saturation
        this.disableHighContrast();
        this.disableHighSaturation();
        this.disableDarkContrast();
        this.disableLightContrast();
        
        // Reset text colors
        this.resetTextColors();
        this.hideTextColorPicker();
        this.resetTitleColors();
        this.hideTitleColorPicker();
        this.resetBackgroundColors();
        this.hideBackgroundColorPicker();
        
        // Disable all profiles
        this.disableSeizureSafe();
        this.disableVisionImpaired();
        this.disableADHDFriendly();
        this.disableCognitiveDisability();
        this.disableReadableFont();
        
        // Remove cognitive boxes
        this.removeCognitiveBoxes();
        
        // Remove ADHD spotlight
        this.removeADHDSpotlight();
        
        // Reset custom colors
        document.documentElement.style.removeProperty('--custom-text-color');
        document.documentElement.style.removeProperty('--custom-title-color');
        document.documentElement.style.removeProperty('--custom-bg-color');
        
        // Reset all toggles in Shadow DOM
        const toggles = this.shadowRoot.querySelectorAll('.toggle-switch input');
        toggles.forEach(toggle => {
            toggle.checked = false;
        });
        
        // Update widget appearance after reset
        this.updateWidgetAppearance();
    }

    loadSettings() {
        const saved = localStorage.getItem('accessibility-settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
        
        // Set default settings for keyboard navigation if not already set
        if (this.settings['keyboard-nav'] === undefined) {
            this.settings['keyboard-nav'] = true; // Enable by default
            console.log('Accessibility Widget: Setting keyboard navigation to enabled by default');
        }
        
        // Force enable keyboard navigation for testing
        this.settings['keyboard-nav'] = true;
        console.log('Accessibility Widget: Forcing keyboard navigation to enabled');
        
        // Ensure line height is always initialized to 100%
        this.lineHeight = 100;
        console.log('Accessibility Widget: Line height initialized to 100%');
        
        console.log('Accessibility Widget: Loaded settings:', this.settings);
    }

    disableReadableFont() {
        document.body.classList.remove('readable-font');
        // Also remove from the widget host element
        this.classList.remove('readable-font');
        console.log('Accessibility Widget: Readable font disabled');
    }

    // Seizure Safe Profile Methods
    enableSeizureSafe() {
        document.body.classList.add('seizure-safe');
        this.addSeizureSafeStyles();
        
        // Update widget appearance to sync Shadow DOM host classes
        this.updateWidgetAppearance();
        
        console.log('Accessibility Widget: Seizure safe profile enabled');
    }

    disableSeizureSafe() {
        document.body.classList.remove('seizure-safe');
        this.removeSeizureSafeStyles();
        
        // Update widget appearance to sync Shadow DOM host classes
        this.updateWidgetAppearance();
        
        console.log('Accessibility Widget: Seizure safe profile disabled');
    }

    addSeizureSafeStyles() {
        // Remove existing styles if they exist
        this.removeSeizureSafeStyles();
        
        // Create style element for seizure-safe overlay
        const style = document.createElement('style');
        style.id = 'accessibility-seizure-safe-styles';
        style.textContent = `
            body.seizure-safe::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(128, 128, 128, 0.3);
                z-index: 99998;
                pointer-events: none;
                mix-blend-mode: multiply;
            }
            
            body.seizure-safe *:not(.accessibility-icon):not(.accessibility-panel):not(#accessibility-icon):not(#accessibility-panel) {
                filter: grayscale(0.6) contrast(0.8) !important;
                transition: filter 0.3s ease !important;
            }
            
            /* Ensure accessibility widget stays above overlay */
            body.seizure-safe .accessibility-widget,
            body.seizure-safe #accessibility-widget {
                z-index: 99999 !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('Accessibility Widget: Seizure-safe overlay styles added');
    }

    removeSeizureSafeStyles() {
        const existingStyle = document.getElementById('accessibility-seizure-safe-styles');
        if (existingStyle) {
            existingStyle.remove();
            console.log('Accessibility Widget: Seizure-safe overlay styles removed');
        }
    }

    // ADHD Friendly Profile Methods
    enableADHDFriendly() {
        document.body.classList.add('adhd-friendly');
        this.createADHDSpotlight();
        console.log('Accessibility Widget: ADHD friendly profile enabled');
    }

    disableADHDFriendly() {
        document.body.classList.remove('adhd-friendly');
        this.removeADHDSpotlight();
        console.log('Accessibility Widget: ADHD friendly profile disabled');
    }

    createADHDSpotlight() {
        // Remove existing spotlight if any
        this.removeADHDSpotlight();
        
        // Create spotlight element
        const spotlight = document.createElement('div');
        spotlight.id = 'adhd-spotlight';
        spotlight.style.cssText = `
            position: fixed;
            width: 100vw;
            height: 150px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            pointer-events: none;
            z-index: 100001;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            box-shadow: inset 0 0 50px rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            backdrop-filter: brightness(1.2) contrast(1.1);
        `;
        
        document.body.appendChild(spotlight);
        
        // Add mouse move event to follow cursor
        document.addEventListener('mousemove', this.adhdSpotlightHandler);
        
        console.log('Accessibility Widget: ADHD spotlight created');
    }

    removeADHDSpotlight() {
        const spotlight = document.getElementById('adhd-spotlight');
        if (spotlight) {
            spotlight.remove();
        }
        
        // Remove event listener
        document.removeEventListener('mousemove', this.adhdSpotlightHandler);
        
        console.log('Accessibility Widget: ADHD spotlight removed');
    }

    adhdSpotlightHandler = (e) => {
        const spotlight = document.getElementById('adhd-spotlight');
        if (spotlight) {
            const y = e.clientY - 75; // Center the spotlight on cursor (half of 150px height)
            
            // Keep spotlight within viewport bounds
            const maxY = window.innerHeight - 150;
            const clampedY = Math.max(0, Math.min(y, maxY));
            
            // Always maintain full width
            spotlight.style.width = '100vw';
            spotlight.style.left = '0';
            spotlight.style.top = clampedY + 'px';
            spotlight.style.transform = 'none'; // Remove the initial centering transform
        }
    }

    // Cognitive Disability Profile Methods
    enableCognitiveDisability() {
        document.body.classList.add('cognitive-disability');
        this.addCognitiveBoxes();
        console.log('Accessibility Widget: Cognitive disability profile enabled');
    }

    disableCognitiveDisability() {
        document.body.classList.remove('cognitive-disability');
        this.removeCognitiveBoxes();
        console.log('Accessibility Widget: Cognitive disability profile disabled');
    }

    addCognitiveBoxes() {
        // Add boxes around buttons and links (excluding accessibility panel)
        const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
        const links = document.querySelectorAll('a');
        
        // Process buttons
        buttons.forEach(button => {
            // Skip if button is inside accessibility panel
            if (button.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                return;
            }
            
            // Create wrapper if not already done
            if (!button.dataset.cognitiveBoxed) {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    display: inline-block;
                    border: 2px solid #6366f1;
                    border-radius: 6px;
                    padding: 4px 8px;
                    margin: 2px;
                    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
                    background: transparent;
                `;
                
                // Insert wrapper before button and move button inside
                button.parentNode.insertBefore(wrapper, button);
                wrapper.appendChild(button);
                button.dataset.cognitiveBoxed = 'true';
            }
        });
        
        // Process links
        links.forEach(link => {
            // Skip if link is inside accessibility panel
            if (link.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon')) {
                return;
            }
            
            // Create wrapper if not already done
            if (!link.dataset.cognitiveBoxed) {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = `
                    display: inline-block;
                    border: 2px solid #6366f1;
                    border-radius: 4px;
                    padding: 2px 4px;
                    margin: 1px;
                    box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
                    background: transparent;
                `;
                
                // Insert wrapper before link and move link inside
                link.parentNode.insertBefore(wrapper, link);
                wrapper.appendChild(link);
                link.dataset.cognitiveBoxed = 'true';
            }
        });
        
        console.log('Accessibility Widget: Cognitive boxes added to', buttons.length, 'buttons and', links.length, 'links');
    }

    removeCognitiveBoxes() {
        // Remove boxes from buttons
        const buttons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
        buttons.forEach(button => {
            if (button.dataset.cognitiveBoxed && button.parentNode && button.parentNode.style.border) {
                const wrapper = button.parentNode;
                const grandParent = wrapper.parentNode;
                grandParent.insertBefore(button, wrapper);
                grandParent.removeChild(wrapper);
                delete button.dataset.cognitiveBoxed;
            }
        });
        
        // Remove boxes from links
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (link.dataset.cognitiveBoxed && link.parentNode && link.parentNode.style.border) {
                const wrapper = link.parentNode;
                const grandParent = wrapper.parentNode;
                grandParent.insertBefore(link, wrapper);
                grandParent.removeChild(wrapper);
                delete link.dataset.cognitiveBoxed;
            }
        });
        
        console.log('Accessibility Widget: Cognitive boxes removed');
    }

    // Text Alignment Methods
    alignTextLeft() {
        console.log('Accessibility Widget: Aligning text left');
        this.applyTextAlignment('left');
    }

    alignTextCenter() {
        console.log('Accessibility Widget: Aligning text center');
        this.applyTextAlignment('center');
    }

    alignTextRight() {
        console.log('Accessibility Widget: Aligning text right');
        this.applyTextAlignment('right');
    }

    applyTextAlignment(alignment) {
        console.log('Accessibility Widget: Applying text alignment:', alignment);
        
        // Apply to document body first
        document.body.style.setProperty('text-align', alignment, 'important');
        
        // Apply to all text elements - be very broad
        const allElements = document.querySelectorAll('*');
        let count = 0;
        
        allElements.forEach(element => {
            // Skip accessibility controls
            if (element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon, .text-alignment-panel, #text-alignment-panel, .alignment-toggle-btn')) {
                return;
            }
            
            // Apply to all elements that can contain text
            const tagName = element.tagName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'li', 'td', 'th', 'blockquote', 'cite', 'address', 'label', 'a'].includes(tagName)) {
                element.style.setProperty('text-align', alignment, 'important');
                count++;
            }
        });
        
        // Also apply to common content classes
        const contentSelectors = [
            '.container', '.hero', '.hero-content', '.hero-text', 
            '.about', '.about-content', '.about-text',
            '.services', '.services-grid', '.service-card',
            '.contact', '.contact-content', '.contact-info',
            '.footer', '.footer-content', '.footer-section',
            '.test-section', '.test-block'
        ];
        
        contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon, .text-alignment-panel, #text-alignment-panel, .alignment-toggle-btn')) {
                    element.style.setProperty('text-align', alignment, 'important');
                    count++;
                }
            });
        });
        
        console.log('Accessibility Widget: Text alignment', alignment, 'applied to', count, 'elements');
    }

    resetTextAlignment() {
        console.log('Accessibility Widget: Resetting text alignment');
        
        // Reset document body
        document.body.style.removeProperty('text-align');
        
        // Reset all elements - be very broad
        const allElements = document.querySelectorAll('*');
        let count = 0;
        
        allElements.forEach(element => {
            // Skip accessibility controls
            if (element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon, .text-alignment-panel, #text-alignment-panel, .alignment-toggle-btn')) {
                return;
            }
            
            // Reset all elements that can contain text
            const tagName = element.tagName.toLowerCase();
            if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'li', 'td', 'th', 'blockquote', 'cite', 'address', 'label', 'a'].includes(tagName)) {
                element.style.removeProperty('text-align');
                count++;
            }
        });
        
        // Also reset common content classes
        const contentSelectors = [
            '.container', '.hero', '.hero-content', '.hero-text', 
            '.about', '.about-content', '.about-text',
            '.services', '.services-grid', '.service-card',
            '.contact', '.contact-content', '.contact-info',
            '.footer', '.footer-content', '.footer-section',
            '.test-section', '.test-block'
        ];
        
        contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.closest('.accessibility-panel, #accessibility-icon, .accessibility-icon, .text-alignment-panel, #text-alignment-panel, .alignment-toggle-btn')) {
                    element.style.removeProperty('text-align');
                    count++;
                }
            });
        });
        
        console.log('Accessibility Widget: Text alignment reset on', count, 'elements');
    }

    createTextAlignmentControls() {
        // Create text alignment controls
        const alignmentContainer = document.createElement('div');
        alignmentContainer.className = 'alignment-controls';
        alignmentContainer.innerHTML = `
            <div class="control-group">
                <h4>Text Alignment</h4>
                <div class="alignment-buttons">
                    <button id="align-left" class="alignment-btn" title="Align Left">
                        <span style="text-align: left;">⬅</span>
                    </button>
                    <button id="align-center" class="alignment-btn" title="Align Center">
                        <span style="text-align: center;">↔</span>
                    </button>
                    <button id="align-right" class="alignment-btn" title="Align Right">
                        <span style="text-align: right;">➡</span>
                    </button>
                    <button id="reset-alignment" class="alignment-btn" title="Reset Alignment">
                        <span>↺</span>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        const alignLeftBtn = alignmentContainer.querySelector('#align-left');
        const alignCenterBtn = alignmentContainer.querySelector('#align-center');
        const alignRightBtn = alignmentContainer.querySelector('#align-right');
        const resetAlignmentBtn = alignmentContainer.querySelector('#reset-alignment');

        alignLeftBtn.addEventListener('click', () => this.alignTextLeft());
        alignCenterBtn.addEventListener('click', () => this.alignTextCenter());
        alignRightBtn.addEventListener('click', () => this.alignTextRight());
        resetAlignmentBtn.addEventListener('click', () => this.resetTextAlignment());

        return alignmentContainer;
    }




    // Vision Impaired Profile Methods
    enableVisionImpaired() {
        console.log('Accessibility Widget: Enabling vision impaired profile');
        document.body.classList.add('vision-impaired');
        this.applyVisionImpairedStyles();
    }

    disableVisionImpaired() {
        console.log('Accessibility Widget: Disabling vision impaired profile');
        document.body.classList.remove('vision-impaired');
        this.removeVisionImpairedStyles();
    }

    applyVisionImpairedStyles() {
        // Vision impaired styles are now handled by CSS classes
        // The body class 'vision-impaired' will apply all the necessary styles
        console.log('Accessibility Widget: Vision impaired styles applied via CSS classes');
        
        // Ensure the Shadow DOM host gets the vision-impaired class
        this.updateWidgetAppearance();
    }

    removeVisionImpairedStyles() {
        // Vision impaired styles are now handled by CSS classes
        // Removing the body class 'vision-impaired' will remove all styles
        console.log('Accessibility Widget: Vision impaired styles removed via CSS classes');
        
        // Ensure the Shadow DOM host gets updated
        this.updateWidgetAppearance();
    }

    // Text Alignment Methods
    enableAlignCenter() {
        console.log('Accessibility Widget: Enabling center alignment');
        
        // Apply center alignment to body first
        document.body.style.textAlign = 'center';
        
        // Then apply to specific content elements, excluding accessibility widget
        const contentElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
        
        contentElements.forEach(element => {
            // Skip accessibility widget elements completely
            if (element.closest('#accessibility-widget-container') || 
                element.closest('.accessibility-panel') ||
                element.closest('#accessibility-icon') ||
                element.closest('.accessibility-icon') ||
                element.closest('.text-alignment-panel') ||
                element.closest('#text-alignment-panel') ||
                element.id === 'accessibility-widget-container' ||
                element.id === 'accessibility-panel' ||
                element.id === 'accessibility-icon' ||
                element.id === 'text-alignment-panel') {
                return; // Skip this element
            }
            
            element.style.textAlign = 'center';
        });
        
        console.log('Accessibility Widget: Center alignment enabled');
    }

    disableAlignCenter() {
        console.log('Accessibility Widget: Disabling center alignment');
        
        // Reset body alignment first
        document.body.style.textAlign = '';
        
        // Then reset specific content elements, excluding accessibility widget
        const contentElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
        
        contentElements.forEach(element => {
            // Skip accessibility widget elements completely
            if (element.closest('#accessibility-widget-container') || 
                element.closest('.accessibility-panel') ||
                element.closest('#accessibility-icon') ||
                element.closest('.accessibility-icon') ||
                element.closest('.text-alignment-panel') ||
                element.closest('#text-alignment-panel') ||
                element.id === 'accessibility-widget-container' ||
                element.id === 'accessibility-panel' ||
                element.id === 'accessibility-icon' ||
                element.id === 'text-alignment-panel') {
                return; // Skip this element
            }
            
            element.style.textAlign = '';
        });
        
        console.log('Accessibility Widget: Center alignment disabled');
    }

    enableAlignLeft() {
        console.log('Accessibility Widget: Enabling left alignment');
        
        // Apply left alignment to body first
        document.body.style.textAlign = 'left';
        
        // Then apply to specific content elements, excluding accessibility widget
        const contentElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
        
        contentElements.forEach(element => {
            // Skip accessibility widget elements completely
            if (element.closest('#accessibility-widget-container') || 
                element.closest('.accessibility-panel') ||
                element.closest('#accessibility-icon') ||
                element.closest('.accessibility-icon') ||
                element.closest('.text-alignment-panel') ||
                element.closest('#text-alignment-panel') ||
                element.id === 'accessibility-widget-container' ||
                element.id === 'accessibility-panel' ||
                element.id === 'accessibility-icon' ||
                element.id === 'text-alignment-panel') {
                return; // Skip this element
            }
            
            element.style.textAlign = 'left';
        });
        
        console.log('Accessibility Widget: Left alignment enabled');
    }

    disableAlignLeft() {
        console.log('Accessibility Widget: Disabling left alignment');
        
        // Only target main content areas, completely avoid accessibility widget
        const mainContent = document.querySelector('main') || document.querySelector('#main') || document.querySelector('.main') || document.querySelector('#content') || document.querySelector('.content');
        
        if (mainContent) {
            // Remove left alignment only from main content area
            const contentElements = mainContent.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
            
            contentElements.forEach(element => {
                element.style.textAlign = '';
            });
        }
        
        console.log('Accessibility Widget: Left alignment disabled');
    }

    enableAlignRight() {
        console.log('Accessibility Widget: Enabling right alignment');
        
        // Apply right alignment to body first, then to specific content elements
        document.body.style.textAlign = 'right';
        
        // Apply to all text elements except accessibility panel
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
        
        textElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('#accessibility-widget-container') && 
                !element.closest('.accessibility-panel') && 
                !element.closest('#accessibility-icon') && 
                !element.closest('.text-alignment-panel') &&
                element.id !== 'accessibility-icon' && 
                element.id !== 'accessibility-panel' &&
                element.id !== 'text-alignment-panel') {
                element.style.textAlign = 'right';
            }
        });
        
        console.log('Accessibility Widget: Right alignment enabled');
    }

    disableAlignRight() {
        console.log('Accessibility Widget: Disabling right alignment');
        
        // Reset body alignment
        document.body.style.textAlign = '';
        
        // Remove right alignment from all text elements except accessibility panel
        const textElements = document.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
        
        textElements.forEach(element => {
            // Skip if element is inside accessibility panel
            if (!element.closest('#accessibility-widget-container') && 
                !element.closest('.accessibility-panel') && 
                !element.closest('#accessibility-icon') && 
                !element.closest('.text-alignment-panel') &&
                element.id !== 'accessibility-icon' && 
                element.id !== 'accessibility-panel' &&
                element.id !== 'text-alignment-panel') {
                element.style.textAlign = '';
            }
        });
        
        console.log('Accessibility Widget: Right alignment disabled');
    }

    resetTextAlignment() {
        console.log('Accessibility Widget: Resetting text alignment');
        
        // Only target main content areas, completely avoid accessibility widget
        const mainContent = document.querySelector('main') || document.querySelector('#main') || document.querySelector('.main') || document.querySelector('#content') || document.querySelector('.content');
        
        if (mainContent) {
            // Reset text alignment only from main content area
            const contentElements = mainContent.querySelectorAll('p, span, div, li, td, th, label, small, em, strong, i, b, h1, h2, h3, h4, h5, h6, a, button, input, textarea, select, article, section, aside, nav, header, footer');
            
            contentElements.forEach(element => {
                element.style.textAlign = '';
            });
        }
        
        console.log('Accessibility Widget: Text alignment reset');
    }



    updateWidgetAppearance() {
        // Sync Shadow DOM host with global accessibility features
        if (this.shadowRoot && this.shadowRoot.host) {
            const container = this.shadowRoot.host;
            
            // Remove all feature classes first
            container.classList.remove(
                'seizure-safe', 'vision-impaired', 'adhd-friendly', 'cognitive-disability',
                'high-contrast', 'monochrome', 'dark-contrast', 'light-contrast',
                'high-saturation', 'low-saturation'
            );
            
            // Add classes based on current settings
            Object.entries(this.settings).forEach(([feature, enabled]) => {
                if (enabled) {
                    container.classList.add(feature);
                }
            });
            
            console.log('Accessibility Widget: Shadow DOM host updated with classes:', container.className);
        }
    }
}

// Initialize the widget when DOM is loaded
let accessibilityWidget;

// Wait for DOM to be ready
function initWidget() {
    console.log('Accessibility Widget: Starting initialization...');
    accessibilityWidget = new AccessibilityWidget();
}

// Try multiple ways to initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
} else {
    // DOM is already loaded
    initWidget();
}

// Also try with a small delay as backup
setTimeout(() => {
    if (!accessibilityWidget) {
        console.log('Accessibility Widget: Initializing with timeout...');
        initWidget();
    }
}, 1000);

// Add global error handler for accessibilityWidget
window.addEventListener('error', (e) => {
    if (e.message.includes('accessibilityWidget')) {
        console.error('Accessibility Widget: Error accessing accessibilityWidget object:', e.message);
        console.log('Accessibility Widget: Current accessibilityWidget state:', accessibilityWidget);
    }
});