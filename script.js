document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const fileCountDisplay = document.getElementById('fileCount');
    const createGifButton = document.getElementById('createGif');
    const resultContainer = document.getElementById('result');
    const statusDisplay = document.getElementById('status');
    const intervalInput = document.getElementById('interval');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
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
        if (selectedFiles.length < 2) {
            statusDisplay.textContent = 'Selecteer ten minste 2 afbeeldingen om een GIF te maken.';
            statusDisplay.style.color = 'red';
            return;
        }

        statusDisplay.textContent = 'GIF wordt gemaakt...';
        statusDisplay.style.color = '#ff9800';
        createGifButton.disabled = true;

        try {
            const images = [];
            for (const file of selectedFiles) {
                const dataUrl = await readFileAsDataURL(file);
                images.push(dataUrl);
            }

            gifshot.createGIF({
                images: images,
                gifWidth: parseInt(widthInput.value),
                gifHeight: parseInt(heightInput.value),
                interval: parseFloat(intervalInput.value),
                numWorkers: 2,
            }, (obj) => {
                if (!obj.error) {
                    const animatedImage = obj.image;
                    resultContainer.innerHTML = `<img src="${animatedImage}" alt="Gegenereerde GIF">`;
                    downloadLink.href = animatedImage;
                    downloadContainer.style.display = 'block';
                    statusDisplay.textContent = 'Klaar!';
                    statusDisplay.style.color = 'green';
                } else {
                    statusDisplay.textContent = 'Er is een fout opgetreden: ' + obj.errorMsg;
                    statusDisplay.style.color = 'red';
                }
                createGifButton.disabled = false;
            });
        } catch (error) {
            statusDisplay.textContent = 'Er is een fout opgetreden bij het inlezen van de bestanden.';
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
