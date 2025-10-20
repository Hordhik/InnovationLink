/**
 * Sidebar Startup Updates Widget - Embeddable
 * Small widget for website sidebars
 * 
 * Usage:
 * <div id="startup-sidebar-widget"></div>
 * <script src="sidebar-startup-widget.js"></script>
 */

(function() {
    'use strict';

    // Widget configuration
    const SIDEBAR_CONFIG = {
        apiBase: 'http://127.0.0.1:8000', // Change to your production API URL
        containerId: 'startup-sidebar-widget',
        maxEvents: 8,
        autoRefresh: true,
        refreshInterval: 300000, // 5 minutes
        width: '320px', // Can be changed: '280px', '100%', etc.
        height: '500px'
    };

    // Sidebar widget styles
    const SIDEBAR_STYLES = `
        .startup-sidebar-embed {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: ${SIDEBAR_CONFIG.width};
            max-width: 100%;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.12);
            overflow: hidden;
            position: relative;
            margin: 0;
        }
        
        .startup-sidebar-embed * {
            box-sizing: border-box;
        }
        
        .startup-sidebar-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 15px;
            text-align: center;
        }
        
        .startup-sidebar-title {
            margin: 0;
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 2px;
        }
        
        .startup-sidebar-subtitle {
            margin: 0;
            font-size: 11px;
            opacity: 0.9;
        }
        
        .startup-sidebar-controls {
            padding: 8px 12px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 6px;
        }
        
        .startup-sidebar-btn {
            flex: 1;
            padding: 5px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            font-weight: 500;
            transition: all 0.2s ease;
            background-color: #3498db;
            color: white;
        }
        
        .startup-sidebar-btn:hover {
            background-color: #2980b9;
            transform: translateY(-1px);
        }
        
        .startup-sidebar-content {
            height: ${SIDEBAR_CONFIG.height === 'auto' ? 'auto' : `calc(${SIDEBAR_CONFIG.height} - 140px)`};
            max-height: 400px;
            overflow-y: auto;
            padding: 0;
        }
        
        .startup-sidebar-content::-webkit-scrollbar {
            width: 3px;
        }
        
        .startup-sidebar-content::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        .startup-sidebar-content::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
        }
        
        .startup-sidebar-filter {
            width: 100%;
            padding: 6px 8px;
            border: none;
            background: #f8f9fa;
            font-size: 10px;
            color: #666;
            border-bottom: 1px solid #eee;
        }
        
        .startup-sidebar-events {
            padding: 0;
        }
        
        .startup-sidebar-event {
            border-bottom: 1px solid #f0f0f0;
            padding: 10px 12px;
            transition: background-color 0.2s ease;
            cursor: pointer;
        }
        
        .startup-sidebar-event:hover {
            background-color: #f8f9fa;
        }
        
        .startup-sidebar-event:last-child {
            border-bottom: none;
        }
        
        .startup-sidebar-event-title {
            font-size: 12px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 4px 0;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .startup-sidebar-event-organizer {
            color: #3498db;
            font-weight: 500;
            font-size: 10px;
            margin-bottom: 4px;
            display: block;
        }
        
        .startup-sidebar-event-type {
            display: inline-block;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .startup-sidebar-type-startup_program {
            background-color: #e8f5e8;
            color: #27ae60;
        }
        
        .startup-sidebar-type-government_scheme {
            background-color: #fef9e7;
            color: #f39c12;
        }
        
        .startup-sidebar-type-incubator {
            background-color: #ebf3fd;
            color: #3498db;
        }
        
        .startup-sidebar-type-funding {
            background-color: #fdf2e9;
            color: #e67e22;
        }
        
        .startup-sidebar-event-date {
            font-size: 9px;
            color: #999;
            margin-top: 3px;
        }
        
        .startup-sidebar-status {
            text-align: center;
            padding: 12px;
            font-size: 10px;
            font-weight: 500;
        }
        
        .startup-sidebar-status.loading {
            background-color: #e8f4fd;
            color: #2980b9;
        }
        
        .startup-sidebar-status.success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .startup-sidebar-status.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .startup-sidebar-no-events {
            text-align: center;
            padding: 25px 15px;
            color: #7f8c8d;
        }
        
        .startup-sidebar-no-events h4 {
            margin: 0 0 6px 0;
            font-size: 13px;
        }
        
        .startup-sidebar-no-events p {
            margin: 0;
            font-size: 10px;
            line-height: 1.4;
        }
        
        .startup-sidebar-footer {
            background-color: #f8f9fa;
            padding: 6px 12px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 8px;
            color: #999;
        }
        
        .startup-sidebar-stats {
            display: flex;
            justify-content: space-around;
            padding: 6px 12px;
            background-color: #f8f9fa;
            border-bottom: 1px solid #eee;
            font-size: 9px;
        }
        
        .startup-sidebar-stat {
            text-align: center;
        }
        
        .startup-sidebar-stat-number {
            font-size: 14px;
            font-weight: bold;
            color: #3498db;
            display: block;
        }
        
        .startup-sidebar-stat-label {
            font-size: 8px;
            color: #7f8c8d;
            text-transform: uppercase;
        }
        
        .startup-sidebar-loading {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 1px solid #f3f3f3;
            border-top: 1px solid #3498db;
            border-radius: 50%;
            animation: sidebarSpin 1s linear infinite;
        }
        
        @keyframes sidebarSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 480px) {
            .startup-sidebar-embed {
                width: 100%;
                max-width: 300px;
            }
        }
    `;

    // Widget HTML template
    const SIDEBAR_TEMPLATE = `
        <div class="startup-sidebar-embed">
            <div class="startup-sidebar-header">
                <h3 class="startup-sidebar-title">🚀 Startup Updates</h3>
                <p class="startup-sidebar-subtitle">Latest opportunities</p>
            </div>
            
            <div class="startup-sidebar-stats" id="startupSidebarStats" style="display: none;">
                <div class="startup-sidebar-stat">
                    <span class="startup-sidebar-stat-number" id="startupSidebarTotalEvents">0</span>
                    <span class="startup-sidebar-stat-label">Updates</span>
                </div>
                <div class="startup-sidebar-stat">
                    <span class="startup-sidebar-stat-number" id="startupSidebarLastUpdated">-</span>
                    <span class="startup-sidebar-stat-label">Time</span>
                </div>
            </div>
            
            <div class="startup-sidebar-controls">
                <button class="startup-sidebar-btn" onclick="StartupSidebarWidget.refresh()">🔄</button>
                <button class="startup-sidebar-btn" onclick="StartupSidebarWidget.update()">📡</button>
            </div>
            
            <select class="startup-sidebar-filter" id="startupSidebarFilter" onchange="StartupSidebarWidget.filter()">
                <option value="">All Types</option>
                <option value="startup_program">Programs</option>
                <option value="government_scheme">Government</option>
                <option value="incubator">Incubators</option>
                <option value="funding">Funding</option>
            </select>
            
            <div class="startup-sidebar-content">
                <div id="startupSidebarStatus"></div>
                <div class="startup-sidebar-events" id="startupSidebarEvents"></div>
            </div>
            
            <div class="startup-sidebar-footer">
                Auto-updates • Innovation Link
            </div>
        </div>
    `;

    // Widget functionality
    window.StartupSidebarWidget = {
        events: [],
        refreshTimer: null,

        init: function() {
            this.injectStyles();
            this.injectHTML();
            this.loadEvents();
            
            if (SIDEBAR_CONFIG.autoRefresh) {
                this.startAutoRefresh();
            }
        },

        injectStyles: function() {
            if (!document.getElementById('startup-sidebar-styles')) {
                const style = document.createElement('style');
                style.id = 'startup-sidebar-styles';
                style.textContent = SIDEBAR_STYLES;
                document.head.appendChild(style);
            }
        },

        injectHTML: function() {
            const container = document.getElementById(SIDEBAR_CONFIG.containerId);
            if (container) {
                container.innerHTML = SIDEBAR_TEMPLATE;
            } else {
                console.error('Startup Sidebar Widget: Container not found. Add <div id="startup-sidebar-widget"></div>');
            }
        },

        showStatus: function(message, type = 'loading') {
            const statusEl = document.getElementById('startupSidebarStatus');
            if (statusEl) {
                statusEl.className = `startup-sidebar-status ${type}`;
                if (type === 'loading') {
                    statusEl.innerHTML = `<span class="startup-sidebar-loading"></span> ${message}`;
                } else {
                    statusEl.textContent = message;
                }
                statusEl.style.display = 'block';
            }
        },

        hideStatus: function() {
            const statusEl = document.getElementById('startupSidebarStatus');
            if (statusEl) {
                statusEl.style.display = 'none';
            }
        },

        loadEvents: async function() {
            this.showStatus('Loading...', 'loading');
            
            try {
                const response = await fetch(`${SIDEBAR_CONFIG.apiBase}/events?limit=${SIDEBAR_CONFIG.maxEvents}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }
                
                const data = await response.json();
                this.events = data.events || [];
                this.displayEvents(this.events);
                this.updateStats(data);
                
                this.showStatus('Updated!', 'success');
                setTimeout(() => this.hideStatus(), 1500);
                
            } catch (error) {
                console.error('Sidebar Widget error:', error);
                this.showStatus('Offline', 'error');
                this.displayOfflineMessage();
            }
        },

        displayEvents: function(events) {
            const container = document.getElementById('startupSidebarEvents');
            if (!container) return;
            
            if (events.length === 0) {
                container.innerHTML = `
                    <div class="startup-sidebar-no-events">
                        <h4>No updates</h4>
                        <p>Check back soon for new opportunities</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = events.map(event => `
                <div class="startup-sidebar-event" onclick="StartupSidebarWidget.openEvent('${event.source_url}')">
                    <h4 class="startup-sidebar-event-title">${event.title}</h4>
                    <span class="startup-sidebar-event-organizer">📍 ${event.organizer}</span>
                    
                    <span class="startup-sidebar-event-type startup-sidebar-type-${event.event_type}">
                        ${event.event_type.replace('_', ' ')}
                    </span>
                    
                    ${event.date ? `<div class="startup-sidebar-event-date">📅 ${new Date(event.date).toLocaleDateString()}</div>` : ''}
                </div>
            `).join('');
        },

        displayOfflineMessage: function() {
            const container = document.getElementById('startupSidebarEvents');
            if (container) {
                container.innerHTML = `
                    <div class="startup-sidebar-no-events">
                        <h4>Offline</h4>
                        <p>Unable to connect</p>
                    </div>
                `;
            }
        },

        filter: function() {
            const filterSelect = document.getElementById('startupSidebarFilter');
            if (!filterSelect) return;
            
            const filterValue = filterSelect.value;
            const filtered = filterValue 
                ? this.events.filter(event => event.event_type === filterValue)
                : this.events;
            
            this.displayEvents(filtered);
        },

        updateStats: function(data) {
            const totalEl = document.getElementById('startupSidebarTotalEvents');
            const timeEl = document.getElementById('startupSidebarLastUpdated');
            const statsEl = document.getElementById('startupSidebarStats');
            
            if (totalEl) totalEl.textContent = data.count || 0;
            if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            if (statsEl) statsEl.style.display = 'flex';
        },

        openEvent: function(url) {
            if (url && url !== 'https://example.com') {
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        },

        refresh: function() {
            this.loadEvents();
        },

        update: async function() {
            this.showStatus('Updating...', 'loading');
            
            try {
                const response = await fetch(`${SIDEBAR_CONFIG.apiBase}/scrape`, {
                    method: 'POST'
                });
                
                if (response.ok) {
                    this.showStatus('Started!', 'success');
                    setTimeout(() => this.loadEvents(), 3000);
                } else {
                    throw new Error('Update failed');
                }
            } catch (error) {
                this.showStatus('Failed', 'error');
            }
        },

        startAutoRefresh: function() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
            
            this.refreshTimer = setInterval(() => {
                this.loadEvents();
            }, SIDEBAR_CONFIG.refreshInterval);
        },

        destroy: function() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
            }
        }
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => StartupSidebarWidget.init());
    } else {
        StartupSidebarWidget.init();
    }

    // Cleanup on unload
    window.addEventListener('beforeunload', () => StartupSidebarWidget.destroy());

})();