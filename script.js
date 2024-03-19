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
            
                if (regions.length > 0) {
                    const firstRegion = regions[0];
                    firstRegion.data.concepts.forEach(concept => {
                        text += concept.name + ' ';
                    });
            
                    document.getElementById('result').innerText = text.trim();
            
                    // Set the result of image analysis as the input of the search bar
                    document.getElementById('searchInput').value = text.trim();
                    handleSearch();
                }
            }
             else {
                document.getElementById('result').innerText = 'No text found in the image.';
            }
            fetchCatalog()  
        })
        .catch(error => {
            console.log('Error:', error);
            document.getElementById('result').innerText = 'An error occurred while processing the image.';
        });
}

function searchText() {
    const imageText = document.getElementById('result').innerText.toLowerCase();
    const searchText = document.getElementById('searchInput').value.toLowerCase();
   

    if (imageText.includes(searchText)) {
        document.getElementById('searchResult').innerText = 'Text found in the image.';
    } else {
        document.getElementById('searchResult').innerText = 'Text not found in the image.';
    }

}





function fetchCatalog() {
    return fetch('catalog.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch catalog');
            }
            return response.json();
        })
        .catch(error => {
            console.error(error);
        });
}

function createProductCard(product) {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
        <h3>${product.name}</h3>
        <div class="image-container">
            <img src="images/${product.images[0]}" alt="${product.name}" class="product-image">
        </div>
        <p>${product.description}</p>
        <p>Price: ${product.price}</p>
    `;

    const imageElement = productCard.querySelector('.product-image');
    let imageIndex = 0;

    imageElement.addEventListener('click', () => {
        imageIndex = (imageIndex + 1) % product.images.length;
        imageElement.src = `images/${product.images[imageIndex]}`;
    });

    return productCard;
}


function displayCatalog() {
    fetchCatalog().then(catalogs => {
        if (catalogs) {
            const catalogContainer = document.getElementById("catalogs");
            catalogContainer.innerHTML = "";
            catalogs.forEach(catalog => {
                const catalogDiv = document.createElement("div");
                catalogDiv.classList.add("catalog");
                catalogDiv.innerHTML = `<h2>${catalog.name}</h2>`;
                catalog.products.forEach(product => {
                    const productCard = createProductCard(product);
                    catalogDiv.appendChild(productCard);
                });
                catalogContainer.appendChild(catalogDiv);
            });
        }
    });
}

function handleVoiceSearch() {
    const recognition = new webkitSpeechRecognition() || speechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = function(event) {
        const voiceSearchResult = event.results[0][0].transcript;
        document.getElementById("searchInput").value = voiceSearchResult;
        handleSearch();
    };
    recognition.start();
}

function handleSearch() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const productCards = document.querySelectorAll(".product-card");
    productCards.forEach(card => {
        const productName = card.querySelector("h3").textContent.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

document.getElementById("voice-search-button").addEventListener("click", handleVoiceSearch);
document.getElementById("searchInput").addEventListener("input", handleSearch);

displayCatalog();




