import React, { useState, useEffect } from 'react';
import './WebsiteSettings.css?v=7';

const WebsiteSettings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'HyperTool',
        siteTagline: 'Professional Invoice Management System',
        contactEmail: 'support@hypertool.com',
        contactPhone: '+1 234 567 8900',
        address: '123 Business Street, Tech City, TC 12345'
    });

    // Hero Section
    const [heroSettings, setHeroSettings] = useState({
        title: 'Streamline Your Business',
        subtitle: 'Professional invoice management made simple',
        ctaText: 'Get Started',
        backgroundImage: null
    });

    // Features
    const [features, setFeatures] = useState([
        { id: 1, icon: '📊', title: 'Invoice Management', description: 'Create and manage invoices easily' },
        { id: 2, icon: '👥', title: 'Client Management', description: 'Keep track of all your clients' },
        { id: 3, icon: '📈', title: 'Analytics', description: 'Detailed business insights' }
    ]);

    // Pricing Plans
    const [pricingPlans, setPricingPlans] = useState([
        { id: 1, name: 'Basic', price: 29, features: ['10 Invoices/month', '5 Clients', 'Email Support'] },
        { id: 2, name: 'Pro', price: 79, features: ['Unlimited Invoices', 'Unlimited Clients', 'Priority Support', 'Analytics'] },
        { id: 3, name: 'Enterprise', price: 199, features: ['Everything in Pro', 'Custom Branding', 'API Access', 'Dedicated Support'] }
    ]);

    // Social Media Links
    const [socialLinks, setSocialLinks] = useState({
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
    });

    // Logo & Images
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('/hypertool-logo.png');

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveGeneral = async () => {
        setLoading(true);
        try {
            // API call to save general settings
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
            setMessage({ type: 'success', text: 'General settings saved successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddFeature = () => {
        const newFeature = {
            id: features.length + 1,
            icon: '✨',
            title: 'New Feature',
            description: 'Feature description'
        };
        setFeatures([...features, newFeature]);
    };

    const handleUpdateFeature = (id, field, value) => {
        setFeatures(features.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleDeleteFeature = (id) => {
        setFeatures(features.filter(f => f.id !== id));
    };

    const handleAddPlan = () => {
        const newPlan = {
            id: pricingPlans.length + 1,
            name: 'New Plan',
            price: 0,
            features: []
        };
        setPricingPlans([...pricingPlans, newPlan]);
    };

    const handleUpdatePlan = (id, field, value) => {
        setPricingPlans(pricingPlans.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleDeletePlan = (id) => {
        setPricingPlans(pricingPlans.filter(p => p.id !== id));
    };

    const handleAddPlanFeature = (planId) => {
        setPricingPlans(pricingPlans.map(p =>
            p.id === planId ? { ...p, features: [...p.features, 'New Feature'] } : p
        ));
    };

    const handleUpdatePlanFeature = (planId, index, value) => {
        setPricingPlans(pricingPlans.map(p => {
            if (p.id === planId) {
                const newFeatures = [...p.features];
                newFeatures[index] = value;
                return { ...p, features: newFeatures };
            }
            return p;
        }));
    };

    const handleDeletePlanFeature = (planId, index) => {
        setPricingPlans(pricingPlans.map(p => {
            if (p.id === planId) {
                return { ...p, features: p.features.filter((_, i) => i !== index) };
            }
            return p;
        }));
    };

    return (
        <div className="website-settings-container">
            <div className="website-settings-header">
                <h1 className="website-settings-title">Website Management</h1>
                <p className="website-settings-subtitle">Manage all website content, images, and settings</p>
            </div>

            {message && (
                <div className={`website-settings-message ${message.type}`}>
                    {message.type === 'success' ? '✓' : '⚠️'} {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="website-settings-tabs">
                <button
                    className={`website-settings-tab ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    General Settings
                </button>
                <button
                    className={`website-settings-tab ${activeTab === 'hero' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hero')}
                >
                    Hero Section
                </button>
                <button
                    className={`website-settings-tab ${activeTab === 'features' ? 'active' : ''}`}
                    onClick={() => setActiveTab('features')}
                >
                    Features
                </button>
                <button
                    className={`website-settings-tab ${activeTab === 'pricing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pricing')}
                >
                    Pricing Plans
                </button>
                <button
                    className={`website-settings-tab ${activeTab === 'branding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('branding')}
                >
                    Branding & Images
                </button>
                <button
                    className={`website-settings-tab ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                >
                    Social Media
                </button>
            </div>

            {/* Tab Content */}
            <div className="website-settings-content">
                {/* General Settings Tab */}
                {activeTab === 'general' && (
                    <div className="settings-panel">
                        <h2 className="panel-title">General Website Settings</h2>

                        <div className="form-group">
                            <label>Site Name</label>
                            <input
                                type="text"
                                value={generalSettings.siteName}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Site Tagline</label>
                            <input
                                type="text"
                                value={generalSettings.siteTagline}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, siteTagline: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Email</label>
                            <input
                                type="email"
                                value={generalSettings.contactEmail}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input
                                type="tel"
                                value={generalSettings.contactPhone}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Business Address</label>
                            <textarea
                                value={generalSettings.address}
                                onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                                className="form-textarea"
                                rows="3"
                            />
                        </div>

                        <button onClick={handleSaveGeneral} className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save General Settings'}
                        </button>
                    </div>
                )}

                {/* Hero Section Tab */}
                {activeTab === 'hero' && (
                    <div className="settings-panel">
                        <h2 className="panel-title">Hero Section Settings</h2>

                        <div className="form-group">
                            <label>Hero Title</label>
                            <input
                                type="text"
                                value={heroSettings.title}
                                onChange={(e) => setHeroSettings({ ...heroSettings, title: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Hero Subtitle</label>
                            <input
                                type="text"
                                value={heroSettings.subtitle}
                                onChange={(e) => setHeroSettings({ ...heroSettings, subtitle: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Call-to-Action Button Text</label>
                            <input
                                type="text"
                                value={heroSettings.ctaText}
                                onChange={(e) => setHeroSettings({ ...heroSettings, ctaText: e.target.value })}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Background Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setHeroSettings({ ...heroSettings, backgroundImage: e.target.files[0] })}
                                className="form-file"
                            />
                        </div>

                        <button onClick={handleSaveGeneral} className="save-btn">
                            Save Hero Settings
                        </button>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="settings-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Website Features</h2>
                            <button onClick={handleAddFeature} className="add-btn">+ Add Feature</button>
                        </div>

                        <div className="features-list">
                            {features.map(feature => (
                                <div key={feature.id} className="feature-card">
                                    <div className="feature-card-header">
                                        <input
                                            type="text"
                                            value={feature.icon}
                                            onChange={(e) => handleUpdateFeature(feature.id, 'icon', e.target.value)}
                                            className="icon-input"
                                            placeholder="Icon"
                                        />
                                        <button onClick={() => handleDeleteFeature(feature.id)} className="delete-btn-small">×</button>
                                    </div>
                                    <input
                                        type="text"
                                        value={feature.title}
                                        onChange={(e) => handleUpdateFeature(feature.id, 'title', e.target.value)}
                                        className="form-input"
                                        placeholder="Feature Title"
                                    />
                                    <textarea
                                        value={feature.description}
                                        onChange={(e) => handleUpdateFeature(feature.id, 'description', e.target.value)}
                                        className="form-textarea"
                                        rows="2"
                                        placeholder="Feature Description"
                                    />
                                </div>
                            ))}
                        </div>

                        <button onClick={handleSaveGeneral} className="save-btn">
                            Save Features
                        </button>
                    </div>
                )}

                {/* Pricing Plans Tab */}
                {activeTab === 'pricing' && (
                    <div className="settings-panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Pricing Plans</h2>
                            <button onClick={handleAddPlan} className="add-btn">+ Add Plan</button>
                        </div>

                        <div className="pricing-grid">
                            {pricingPlans.map(plan => (
                                <div key={plan.id} className="pricing-card">
                                    <div className="pricing-card-header">
                                        <button onClick={() => handleDeletePlan(plan.id)} className="delete-btn-small">×</button>
                                    </div>
                                    <input
                                        type="text"
                                        value={plan.name}
                                        onChange={(e) => handleUpdatePlan(plan.id, 'name', e.target.value)}
                                        className="form-input"
                                        placeholder="Plan Name"
                                    />
                                    <div className="price-input-group">
                                        <span className="currency">$</span>
                                        <input
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => handleUpdatePlan(plan.id, 'price', parseFloat(e.target.value))}
                                            className="form-input price-input"
                                            placeholder="Price"
                                        />
                                        <span className="period">/month</span>
                                    </div>

                                    <div className="plan-features">
                                        <label>Features:</label>
                                        {plan.features.map((feature, index) => (
                                            <div key={index} className="plan-feature-item">
                                                <input
                                                    type="text"
                                                    value={feature}
                                                    onChange={(e) => handleUpdatePlanFeature(plan.id, index, e.target.value)}
                                                    className="form-input-small"
                                                />
                                                <button onClick={() => handleDeletePlanFeature(plan.id, index)} className="delete-btn-tiny">×</button>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddPlanFeature(plan.id)} className="add-feature-btn">+ Add Feature</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleSaveGeneral} className="save-btn">
                            Save Pricing Plans
                        </button>
                    </div>
                )}

                {/* Branding & Images Tab */}
                {activeTab === 'branding' && (
                    <div className="settings-panel">
                        <h2 className="panel-title">Branding & Images</h2>

                        <div className="form-group">
                            <label>Website Logo</label>
                            <div className="logo-upload-area">
                                <div className="logo-preview">
                                    <img src={logoPreview} alt="Logo Preview" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="form-file"
                                    id="logo-upload"
                                />
                                <label htmlFor="logo-upload" className="upload-label">
                                    Choose Logo Image
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Favicon</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-file"
                            />
                        </div>

                        <button onClick={handleSaveGeneral} className="save-btn">
                            Save Branding
                        </button>
                    </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && (
                    <div className="settings-panel">
                        <h2 className="panel-title">Social Media Links</h2>

                        <div className="form-group">
                            <label>Facebook URL</label>
                            <input
                                type="url"
                                value={socialLinks.facebook}
                                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                                className="form-input"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>

                        <div className="form-group">
                            <label>Twitter URL</label>
                            <input
                                type="url"
                                value={socialLinks.twitter}
                                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                className="form-input"
                                placeholder="https://twitter.com/yourhandle"
                            />
                        </div>

                        <div className="form-group">
                            <label>LinkedIn URL</label>
                            <input
                                type="url"
                                value={socialLinks.linkedin}
                                onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                className="form-input"
                                placeholder="https://linkedin.com/company/yourcompany"
                            />
                        </div>

                        <div className="form-group">
                            <label>Instagram URL</label>
                            <input
                                type="url"
                                value={socialLinks.instagram}
                                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                className="form-input"
                                placeholder="https://instagram.com/yourhandle"
                            />
                        </div>

                        <button onClick={handleSaveGeneral} className="save-btn">
                            Save Social Links
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteSettings;
