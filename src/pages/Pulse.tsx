import { useState, useEffect } from 'react';
import { fetchJson } from '../utils/api';
import { Search, Send, Users, MessageCircle, Zap } from 'lucide-react';
import './Pulse.css';

interface Customer {
    id: string;
    fullName: string;
    phone: string;
    city: string;
    state: string;
    selected?: boolean;
}

export default function Pulse() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sending] = useState(false);

    // Load customers
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await fetchJson('/api/admin/customers');
            const formatted = data.map((customer: any) => ({
                id: customer.id,
                fullName: customer.name || `Customer ${customer.mobile}`,
                phone: customer.mobile || '',
                city: customer.city || 'Unknown',
                state: customer.state || '',
                selected: false
            })).filter((c: Customer) => c.phone);
            setCustomers(formatted);
        } catch (err) {
            console.error('Failed to load customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectAll = false;
    const selectedCount = 0;
    const message = '';

    return (
        <div className="pulse-container">
            <div className="coming-soon-overlay">
                <div className="coming-soon-card">
                    <MessageCircle size={48} color="#F5CE57" />
                    <h2>Coming Soon</h2>
                    <p>WhatsApp Broadcast and Communication Center is under maintenance.</p>
                </div>
            </div>
            <div className="pulse-content-blurred">
                <div className="pulse-header">
                    <div>
                        <h1>Pulse Broadcast</h1>
                        <p>Send WhatsApp updates to your customers instantly</p>
                    </div>
                </div>

                <div className="pulse-stats-row">
                    {/* Total Audience */}
                    <div className="stat-card black">
                        <div className="stat-label">Total Audience</div>
                        <div className="stat-value">{customers.length}</div>
                        <div className="stat-icon-bg">
                            <Users size={24} color="#F5CE57" />
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="stat-card yellow">
                        <div className="stat-label">System Status</div>
                        <div className="stat-value">Inactive</div>
                        <div className="stat-sub">Under Maintenance</div>
                        <div className="stat-icon-bg">
                            <MessageCircle size={24} color="#1c1c1e" />
                        </div>
                    </div>

                    {/* Message Credits */}
                    <div className="stat-card white">
                        <div className="stat-label">Message Credits</div>
                        <div className="stat-value">0</div>
                        <div className="stat-sub">Basic Plan</div>
                        <div className="stat-icon-bg">
                            <Zap size={24} color="#1c1c1e" />
                        </div>
                    </div>
                </div>

                <div className="pulse-grid">
                    {/* Left Column: Customer Selection */}
                    <div className="customer-section">
                        <div className="section-header">
                            <h3>Select Recipients</h3>
                            <div className="search-bar">
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="customer-list-header">
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    disabled
                                />
                                <span className="checkmark"></span>
                                Select All
                            </label>
                            <span className="selected-count">{selectedCount} selected</span>
                        </div>

                        <div className="customer-list">
                            {loading ? (
                                <div className="loading-state">Loading customers...</div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="empty-state">No customers found</div>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <div
                                        key={customer.id}
                                        className={`customer-item ${customer.selected ? 'selected' : ''}`}
                                    >
                                        <label className="checkbox-wrapper" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={customer.selected || false}
                                                disabled
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                        <div className="customer-info">
                                            <div className="customer-name">{customer.fullName}</div>
                                            <div className="customer-details">
                                                <span>{customer.phone}</span>
                                                <span className="dot">•</span>
                                                <span>{customer.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Message Composer */}
                    <div className="composer-section">
                        <div className="composer-card">
                            <h3>Compose Message</h3>

                            <div className="template-selector">
                                <span className="label">Template</span>
                                <select className="template-select" disabled>
                                    <option>Custom Message</option>
                                </select>
                            </div>

                            <div className="message-area">
                                <textarea
                                    placeholder="Type your message here..."
                                    value={message}
                                    disabled
                                />
                                <div className="message-footer">
                                    <span>{message.length} chars</span>
                                    <button className="variable-btn" disabled>{'{name}'}</button>
                                </div>
                            </div>

                            <button
                                className={`send-btn ${sending ? 'sending' : ''}`}
                                disabled
                            >
                                <Send size={18} />
                                Send Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
