/**
 * Startup & Government Updates Widget
 * Embeddable JavaScript widget for any website
 * 
 * Usage:
 * <div id="startup-updates-widget"></div>
 * <script src="startup-widget.js"></script>
 */

(function() {
    'use strict';

    // Widget configuration
    const WIDGET_CONFIG = {
        apiBase: 'http://127.0.0.1:8000', // Change to your production API URL
        containerId: 'startup-updates-widget',
        maxEvents: 8,
        autoRefresh: true,
        refreshInterval: 300000, // 5 minutes
        theme: 'light' // 'light' or 'dark'
    };

    // Widget styles
    const WIDGET_STYLES = `
        .startup-widget-embed {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
            max-width: 100%;
            width: 100%;
        }
        
        .startup-widget-embed * {
            box-sizing: border-box;
        }
        
        .startup-widget-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            text-align: center;
        }
        
        .startup-widget-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .startup-widget-subtitle {
            margin: 0;
            font-size: 13px;
            opacity: 0.9;
        }
        
        .startup-widget-content {
            max-height: 400px;
            overflow-y: auto;
            padding: 0;
        }
        
        .startup-widget-controls {
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .startup-widget-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
            background-color: #3498db;
            color: white;
        }
        
        .startup-widget-btn:hover {
            background-color: #2980b9;
            transform: translateY(-1px);
        }
        
        .startup-widget-filter {
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 11px;
            background: white;
        }
        
        .startup-widget-events {
            padding: 15px 20px;
        }
        
        .startup-widget-event {
            border-bottom: 1px solid #f0f0f0;
            padding: 12px 0;
            margin-bottom: 12px;
        }
        
        .startup-widget-event:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .startup-widget-event-title {
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 6px 0;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .startup-widget-event-organizer {
            color: #3498db;
            font-weight: 500;
            font-size: 12px;
            margin-bottom: 6px;
        }
        
        .startup-widget-event-description {
            color: #666;
            font-size: 12px;
            line-height: 1.4;
            margin-bottom: 8px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .startup-widget-event-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 6px;
            font-size: 10px;
            color: #7f8c8d;
        }
        
        .startup-widget-event-type {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 500;
            text-transform: capitalize;
        }
        
        .startup-widget-type-startup_program {
            background-color: #e8f5e8;
            color: #27ae60;
        }
        
        .startup-widget-type-government_scheme {
            background-color: #fef9e7;
            color: #f39c12;
        }
        
        .startup-widget-type-incubator {
            background-color: #ebf3fd;
            color: #3498db;
        }
        
        .startup-widget-type-funding {
            background-color: #fdf2e9;
            color: #e67e22;
        }
        
        .startup-widget-link {
            margin-top: 6px;
        }
        
        .startup-widget-link a {
            color: #3498db;
            text-decoration: none;
            font-size: 10px;
            display: inline-flex;
            align-items: center;
            gap: 3px;
        }
        
        .startup-widget-link a:hover {
            text-decoration: underline;
        }
        
        .startup-widget-status {
            text-align: center;
            padding: 12px;
            margin: 10px 20px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .startup-widget-status.loading {
            background-color: #e8f4fd;
            color: #2980b9;
        }
        
        .startup-widget-status.success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .startup-widget-status.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .startup-widget-no-events {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
        }
        
        .startup-widget-no-events h4 {
            margin: 0 0 6px 0;
            font-size: 14px;
        }
        
        .startup-widget-no-events p {
            margin: 0;
            font-size: 12px;
        }
        
        .startup-widget-footer {
            background-color: #f8f9fa;
            padding: 8px 20px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 9px;
            color: #999;
        }
        
        /* Mobile responsive */
        @media (max-width: 480px) {
            .startup-widget-controls {
                flex-direction: column;
                gap: 6px;
            }
            
            .startup-widget-btn, .startup-widget-filter {
                width: 100%;
                font-size: 10px;
            }
            
            .startup-widget-events {
                padding: 12px 15px;
            }
            
            .startup-widget-event-meta {
                flex-direction: column;
                gap: 4px;
            }
        }
    `;

    // Widget HTML template
    const WIDGET_TEMPLATE = `
        <div class="startup-widget-embed">
            <div class="startup-widget-header">
                <h3 class="startup-widget-title">🚀 Startup Updates</h3>
                <p class="startup-widget-subtitle">Latest opportunities & programs</p>
            </div>
            
            <div class="startup-widget-controls">
                <button class="startup-widget-btn" onclick="StartupWidget.refresh()">🔄 Refresh</button>
                <select class="startup-widget-filter" id="startupWidgetFilter" onchange="StartupWidget.filter()">
                    <option value="">All Types</option>
                    <option value="startup_program">Programs</option>
                    <option value="government_scheme">Schemes</option>
                    <option value="incubator">Incubators</option>
                    <option value="funding">Funding</option>
                </select>
            </div>
            
            <div class="startup-widget-content">
                <div id="startupWidgetStatus"></div>
                <div class="startup-widget-events" id="startupWidgetEvents"></div>
            </div>
            
            <div class="startup-widget-footer">
                Powered by AI Bot • Auto-updates every 5 minutes
            </div>
        </div>
    `;

    // Widget functionality
    window.StartupWidget = {
        events: [],
        refreshTimer: null,

        init: function() {
            this.injectStyles();
            this.injectHTML();
            this.loadEvents();
            
            if (WIDGET_CONFIG.autoRefresh) {
                this.startAutoRefresh();
            }
        },

        injectStyles: function() {
            if (!document.getElementById('startup-widget-styles')) {
                const style = document.createElement('style');
                style.id = 'startup-widget-styles';
                style.textContent = WIDGET_STYLES;
                document.head.appendChild(style);
            }
        },

        injectHTML: function() {
            const container = document.getElementById(WIDGET_CONFIG.containerId);
            if (container) {
                container.innerHTML = WIDGET_TEMPLATE;
            } else {
                console.error('Startup Widget: Container element not found. Add <div id="startup-updates-widget"></div> to your HTML.');
            }
        },

        showStatus: function(message, type = 'loading') {
            const statusEl = document.getElementById('startupWidgetStatus');
            if (statusEl) {
                statusEl.className = `startup-widget-status ${type}`;
                statusEl.textContent = message;
                statusEl.style.display = 'block';
            }
        },

        hideStatus: function() {
            const statusEl = document.getElementById('startupWidgetStatus');
            if (statusEl) {
                statusEl.style.display = 'none';
            }
        },

        loadEvents: async function() {
            this.showStatus('Loading updates...', 'loading');
            
            try {
                const response = await fetch(`${WIDGET_CONFIG.apiBase}/events?limit=${WIDGET_CONFIG.maxEvents}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                
                const data = await response.json();
                this.events = data.events || [];
                this.displayEvents(this.events);
                
                this.showStatus(`Loaded ${this.events.length} updates`, 'success');
                setTimeout(() => this.hideStatus(), 2000);
                
            } catch (error) {
                console.error('Startup Widget error:', error);
                this.showStatus('Unable to load updates', 'error');
                this.displayOfflineMessage();
            }
        },

        displayEvents: function(events) {
            const container = document.getElementById('startupWidgetEvents');
            if (!container) return;
            
            if (events.length === 0) {
                container.innerHTML = `
                    <div class="startup-widget-no-events">
                        <h4>No updates available</h4>
                        <p>Check back later for new opportunities</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = events.map(event => `
                <div class="startup-widget-event">
                    <h4 class="startup-widget-event-title">${event.title}</h4>
                    <div class="startup-widget-event-organizer">📍 ${event.organizer}</div>
                    
                    ${event.description ? `<div class="startup-widget-event-description">${event.description.substring(0, 120)}${event.description.length > 120 ? '...' : ''}</div>` : ''}
                    
                    <div class="startup-widget-event-meta">
                        ${event.date ? `<span>📅 ${new Date(event.date).toLocaleDateString()}</span>` : ''}
                        ${event.location ? `<span>🌍 ${event.location}</span>` : ''}
                    </div>
                    
                    <span class="startup-widget-event-type startup-widget-type-${event.event_type}">
                        ${event.event_type.replace('_', ' ')}
                    </span>
                    
                    ${event.source_url && event.source_url !== 'https://example.com' ? `
                        <div class="startup-widget-link">
                            <a href="${event.source_url}" target="_blank" rel="noopener">🔗 Learn More</a>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        },

        displayOfflineMessage: function() {
            const container = document.getElementById('startupWidgetEvents');
            if (container) {
                container.innerHTML = `
                    <div class="startup-widget-no-events">
                        <h4>Service Unavailable</h4>
                        <p>Please check your connection and try again</p>
                    </div>
                `;
            }
        },

        filter: function() {
            const filterSelect = document.getElementById('startupWidgetFilter');
            if (!filterSelect) return;
            
            const filterValue = filterSelect.value;
            const filtered = filterValue 
                ? this.events.filter(event => event.event_type === filterValue)
                : this.events;
            
            this.displayEvents(filtered);
        },

        refresh: function() {
            this.loadEvents();
        },

        startAutoRefresh: function() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
            
            this.refreshTimer = setInterval(() => {
                this.loadEvents();
            }, WIDGET_CONFIG.refreshInterval);
        },

        destroy: function() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => StartupWidget.init());
    } else {
        StartupWidget.init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => StartupWidget.destroy());

})();