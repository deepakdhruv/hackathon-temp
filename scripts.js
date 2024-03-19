function analyzeImage() {
    const PAT = '20cec67e6c4642f09497955ed29fbf9b';
    const USER_ID = 'clarifai';
    const APP_ID = 'main';
    const MODEL_ID = 'general-image-detection';
    const MODEL_VERSION_ID = '1580bb1932594c93b7e2e04456af7c6f';
    const imageUrl = document.getElementById('imageUrl').value;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": imageUrl
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.outputs && result.outputs[0] && result.outputs[0].data && result.outputs[0].data.regions) {
                const regions = result.outputs[0].data.regions;
                let text = '';

                regions.forEach(region => {
                    region.data.concepts.forEach(concept => {
                        text += concept.name + ' ';
                    });
                });

                document.getElementById('result').innerText = text.trim();
            } else {
                document.getElementById('result').innerText = 'No text found in the image.';
            }
        })
        .catch(error => {
            console.log('Error:', error);
            document.getElementById('result').innerText = 'An error occurred while processing the image.';
        });
}
