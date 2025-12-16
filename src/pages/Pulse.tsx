import { useState, useEffect } from 'react';
import { fetchJson } from '../utils/api';
import { Search, Calendar, Clock, Send, Users, MessageCircle, CheckCircle, Zap } from 'lucide-react';
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
    const [message, setMessage] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [sending, setSending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleSelectAll = () => {
        const newValue = !selectAll;
        setSelectAll(newValue);
        setCustomers(customers.map(c => ({ ...c, selected: newValue })));
    };

    const handleSelectCustomer = (id: string) => {
        setCustomers(customers.map(c =>
            c.id === id ? { ...c, selected: !c.selected } : c
        ));
    };

    const selectedCount = customers.filter(c => c.selected).length;

    const handleSend = async () => {
        if (selectedCount === 0) return alert('Please select at least one customer');
        if (!message.trim()) return alert('Please enter a message');

        setSending(true);
        try {
            const recipients = customers.filter(c => c.selected).map(c => c.id);

            await fetchJson('/api/admin/broadcast/send', {
                method: 'POST',
                body: JSON.stringify({
                    recipients,
                    message,
                    scheduledAt: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}` : null
                })
            });

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            setMessage('');
            setScheduledDate('');
            setScheduledTime('');

            // Optional: reset selection
            setSelectAll(false);
            setCustomers(customers.map(c => ({ ...c, selected: false })));

        } catch (err: any) {
            console.error('Broadcast failed', err);
            alert(err.message || 'Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pulse-container">
            <div className="pulse-header">
                <div>
                    <h1>Pulse Broadcast</h1>
                    <p>Send WhatsApp updates to your customers instantly</p>
                </div>
            </div>

            <div className="pulse-stats-row">
                {/* Total Customers - Black Card */}
                <div className="stat-card black">
                    <div className="stat-label">Total Audience</div>
                    <div className="stat-value">{customers.length}</div>
                    <div className="stat-icon-bg">
                        <Users size={24} color="#F5CE57" />
                    </div>
                </div>

                {/* WhatsApp Status - Yellow Card */}
                <div className="stat-card yellow">
                    <div className="stat-label">System Status</div>
                    <div className="stat-value">Active</div>
                    <div className="stat-sub">WhatsApp Business API</div>
                    <div className="stat-icon-bg">
                        <MessageCircle size={24} color="#1c1c1e" />
                    </div>
                </div>

                {/* Credits/Balance - White Card */}
                <div className="stat-card white">
                    <div className="stat-label">Message Credits</div>
                    <div className="stat-value">∞</div>
                    <div className="stat-sub">Unlimited Plan</div>
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
                            />
                        </div>
                    </div>

                    <div className="customer-list-header">
                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleSelectAll}
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
                                    onClick={() => handleSelectCustomer(customer.id)}
                                >
                                    <label className="checkbox-wrapper" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={customer.selected || false}
                                            onChange={() => handleSelectCustomer(customer.id)}
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
                                    {customer.selected && <CheckCircle size={16} className="selected-icon" />}
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
                            <select className="template-select">
                                <option>Custom Message</option>
                                <option>Diwali Greeting</option>
                                <option>New Year Wish</option>
                                <option>Project Update</option>
                                <option>Payment Reminder</option>
                            </select>
                        </div>

                        <div className="message-area">
                            <textarea
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <div className="message-footer">
                                <span>{message.length} chars</span>
                                <button className="variable-btn">{'{name}'}</button>
                            </div>
                        </div>

                        <div className="scheduling-options">
                            <div className="schedule-input">
                                <label><Calendar size={14} /> Date</label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                />
                            </div>
                            <div className="schedule-input">
                                <label><Clock size={14} /> Time</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="preview-box">
                            <div className="preview-header">
                                <MessageCircle size={14} /> Message Preview
                            </div>
                            <div className="preview-content">
                                {message || 'Your message will appear here...'}
                            </div>
                        </div>

                        <button
                            className={`send-btn ${sending ? 'sending' : ''}`}
                            onClick={handleSend}
                            disabled={sending || selectedCount === 0}
                        >
                            {sending ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Send size={18} />
                                    {scheduledDate ? 'Schedule Broadcast' : 'Send Now'}
                                    <span className="count-badge">{selectedCount}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showSuccess && (
                <div className="success-toast">
                    <CheckCircle size={20} />
                    <span>Broadcast {scheduledDate ? 'scheduled' : 'sent'} successfully!</span>
                </div>
            )}
        </div>
    );
}
