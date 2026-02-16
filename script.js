document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const fileCountDisplay = document.getElementById('fileCount');
    const createGifButton = document.getElementById('createGif');
    const resultContainer = document.getElementById('result');
    const statusDisplay = document.getElementById('status');
    const intervalInput = document.getElementById('interval');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const textOverlayInput = document.getElementById('textOverlay');
    const filterSelect = document.getElementById('filterSelect');
    const downloadContainer = document.getElementById('downloadContainer');
    const downloadLink = document.getElementById('downloadLink');

    let selectedFiles = [];

    imageInput.addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            fileCountDisplay.textContent = `${selectedFiles.length} bestand(en) geselecteerd.`;
        } else {
            fileCountDisplay.textContent = 'Geen bestanden geselecteerd.';
        }
    });

    createGifButton.addEventListener('click', async () => {
        if (selectedFiles.length === 0) {
            statusDisplay.textContent = 'Selecteer eerst een afbeelding of video.';
            statusDisplay.style.color = 'red';
            return;
        }

        const isVideo = selectedFiles[0].type.startsWith('video/');
        if (!isVideo && selectedFiles.length < 2) {
            statusDisplay.textContent = 'Selecteer ten minste 2 afbeeldingen voor een slideshow.';
            statusDisplay.style.color = 'red';
            return;
        }

        statusDisplay.textContent = 'Bezig met verwerken...';
        statusDisplay.style.color = '#ff9800';
        createGifButton.disabled = true;

        const options = {
            gifWidth: parseInt(widthInput.value),
            gifHeight: parseInt(heightInput.value),
            interval: parseFloat(intervalInput.value),
            numWorkers: 2,
            text: textOverlayInput.value,
            fontWeight: 'bold',
            fontSize: '30px',
            fontColor: 'white',
            textAlign: 'center',
            textBaseline: 'bottom'
        };

        const selectedFilter = filterSelect.value;
        if (selectedFilter === 'grayscale') {
            options.filter = function(data) {
                for (var i = 0; i < data.length; i += 4) {
                    var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                }
            };
        } else if (selectedFilter === 'sepia') {
            options.filter = function(data) {
                for (var i = 0; i < data.length; i += 4) {
                    var r = data[i], g = data[i + 1], b = data[i + 2];
                    data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
                    data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
                    data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
                }
            };
        }

        try {
            if (isVideo) {
                options.video = [URL.createObjectURL(selectedFiles[0])];
            } else {
                const images = [];
                for (const file of selectedFiles) {
                    const dataUrl = await readFileAsDataURL(file);
                    images.push(dataUrl);
                }
                options.images = images;
            }

            gifshot.createGIF(options, (obj) => {
                if (!obj.error) {
                    const animatedImage = obj.image;
                    resultContainer.innerHTML = `<img src="${animatedImage}" alt="Gegenereerde GIF">`;
                    downloadLink.href = animatedImage;
                    downloadContainer.style.display = 'block';
                    statusDisplay.textContent = 'Klaar! Je kunt de GIF nu downloaden.';
                    statusDisplay.style.color = 'green';
                } else {
                    statusDisplay.textContent = 'Fout: ' + obj.errorMsg;
                    statusDisplay.style.color = 'red';
                }
                createGifButton.disabled = false;
            });
        } catch (error) {
            statusDisplay.textContent = 'Fout bij het verwerken van bestanden.';
            statusDisplay.style.color = 'red';
            createGifButton.disabled = false;
        }
    });

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
});
