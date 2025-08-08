const getFirstTimeBuyerSegment = async (url) => {
    try {
        const response = await fetch(`https://permit-indian-guyana-uv.trycloudflare.com/api/v1/customer-segments`, { 
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.segment) {
            throw new Error(data.error || 'No segment found');
        }
        
        console.log('data.segment: ', data.segment);
        return data.segment;
    } catch (error) {
        console.error('Error fetching first-time buyer segment:', error);
        throw error;
    }
}

export default getFirstTimeBuyerSegment