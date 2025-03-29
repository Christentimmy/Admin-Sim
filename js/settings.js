// Settings API functions
const settings = {
    // Get current settings
    getSettings: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/settings/get-settings`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    },

    // Update settings
    updateSettings: async (settingsData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/settings/update-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settingsData)
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
};

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current settings
        const currentSettings = await settings.getSettings();
        
        // Populate form fields with current settings
        if (currentSettings.pricing) {
            document.querySelector('input[value="50"]').value = currentSettings.pricing.baseFare || 50;
            document.querySelector('input[value="15"]').value = currentSettings.pricing.pricePerKm || 15;
            document.querySelector('input[value="5"]').value = currentSettings.pricing.pricePerMin || 5;
            document.querySelector('input[value="100"]').value = currentSettings.pricing.minFare || 100;
            document.querySelector('input[value="20"]').value = currentSettings.pricing.commissionRate || 20;
        }

        // Add event listener to save button
        const saveButton = document.querySelector('.btn-primary');
        saveButton.addEventListener('click', async () => {
            try {
                // Get values from form
                const settingsData = {
                    baseFare: parseFloat(document.querySelector('input[value="50"]').value),
                    pricePerKm: parseFloat(document.querySelector('input[value="15"]').value),
                    pricePerMin: parseFloat(document.querySelector('input[value="5"]').value),
                    minFare: parseFloat(document.querySelector('input[value="100"]').value),
                    commissionRate: parseFloat(document.querySelector('input[value="20"]').value)
                };

                // Update settings
                await settings.updateSettings(settingsData);

                // Show success message
                alert('Settings updated successfully!');
            } catch (error) {
                console.error('Error saving settings:', error);
                alert('Failed to update settings. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error initializing settings page:', error);
        alert('Failed to load settings. Please refresh the page.');
    }
}); 