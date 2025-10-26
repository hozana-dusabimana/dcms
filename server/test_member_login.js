const axios = require('axios');

async function testMemberLogin() {
    try {
        console.log('Testing member login with phone: 0785419324');
        
        const response = await axios.post('http://localhost:5000/api/member-auth/login', {
            phone: '0785419324'
        });
        
        console.log('✅ Member login successful!');
        console.log('Response:', response.data);
        
        // Test member notifications with the token
        if (response.data.token) {
            console.log('\nTesting member notifications...');
            const notificationResponse = await axios.get('http://localhost:5000/api/member-notifications', {
                headers: {
                    'Authorization': `Bearer ${response.data.token}`
                }
            });
            
            console.log('✅ Member notifications retrieved!');
            console.log('Notifications:', notificationResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testMemberLogin();

