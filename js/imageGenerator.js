function preloadLogos(callback) {
    fetch('assets/logos/logos.json')
        .then(response => response.json())
        .then(paths => Promise.all(paths.map(path => fetch(path).then(res => res.text()))))
        .then(base64Strings => {
            let loadedCount = 0;
            const images = [];
            base64Strings.forEach(function(logoSrc, index) {
                const img = new Image();
                img.src = logoSrc;
                img.onload = function() {
                    images[index] = img;
                    loadedCount++;
                    if (loadedCount === base64Strings.length) {
                        callback(images);
                    }
                };
                img.onerror = function() {
                    loadedCount++;
                    if (loadedCount === base64Strings.length) {
                        callback(images);
                    }
                };
            });
        })
        .catch(() => callback([]));
}
export function generateImage(selectedGames, modus, uploadedImageUrl) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // Hintergrund laden (hochgeladenes Hintergrundbild verwenden)
    const img = new Image();
    img.src = uploadedImageUrl ? uploadedImageUrl : '/mnt/data/1.png';
    
    img.onload = function() {
        const targetAspectRatio = 4 / 5;
        let imgWidth = img.width;
        let imgHeight = img.height;
        let cropWidth, cropHeight, offsetX, offsetY;

        if (imgWidth / imgHeight > targetAspectRatio) {
            cropHeight = imgHeight;
            cropWidth = imgHeight * targetAspectRatio;
            offsetX = (imgWidth - cropWidth) / 2;
            offsetY = 0;
        } else {
            cropWidth = imgWidth;
            cropHeight = imgWidth / targetAspectRatio;
            offsetX = 0;
            offsetY = (imgHeight - cropHeight) / 2;
        }

        ctx.filter = 'grayscale(100%) blur(2px)';
        ctx.drawImage(img, offsetX, offsetY, cropWidth, cropHeight, 0, 150, canvas.width, 1050);
        ctx.filter = 'none';

       // Kopfzeile zeichnen
        const bildTitel = modus === 'turnier' ? ($('#titelEingabe').val() || 'Turnier') : ($('#titelEingabe').val() || 'Heimspiele');
        const selectedDate = $('#datumAuswahl').val();
        const datumText = new Date(selectedDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        ctx.fillStyle = '#2C4A9A';
        ctx.fillRect(0, 0, canvas.width, 180);
        ctx.font = 'bold 60px Ruda';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bildTitel, canvas.width / 2, 70);
        ctx.font = '40px Ruda';
        ctx.fillText(datumText, canvas.width / 2, 130);
        
        // Spiele in der Mitte des Bildes platzieren
        const totalHeight = selectedGames.length * 140;
        let yPosition = 150 + (1050 - totalHeight) / 2;
        selectedGames.each(function() {
            const zeit = $(this).find('td:nth-child(1)').text();
            const ort = $(this).find('td:nth-child(2)').text();
            const teamA = $(this).find('td:nth-child(3)').text();
            const teamB = $(this).find('td:nth-child(4)').text();
            const liga = modus === 'normal' ? $(this).find('td:nth-child(5)').text() : '';
            
            ctx.fillStyle = 'rgba(44, 74, 154, 0.85)';
            ctx.fillRect(50, yPosition, 980, 60);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 30px Ruda';
            ctx.textAlign = 'left';
            ctx.fillText(`${zeit} @ ${ort}`, 60, yPosition + 40);
            yPosition += 60;
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = 'white';
            ctx.fillRect(50, yPosition, 980, 60);
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'black';
            ctx.font = '30px Ruda';
            ctx.fillText(`${liga ? liga + ' - ' : ''}${teamA} vs ${teamB}`, 60, yPosition + 40);
            yPosition += 80;
        });

        preloadLogos(function(images) {
            console.log("Drawing footer with logos.");
            yPosition += 50;
            ctx.fillStyle = '#2C4A9A';
            ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
            let xPosition = 50;
            images.forEach(function(logoImg) {
                if (logoImg) {
                    console.log("Drawing logo.");
                    ctx.drawImage(logoImg, xPosition, canvas.height - 130, 200, 100);
                    console.log('Logo position:', 'x:', xPosition, 'y:', canvas.height - 130, 'z-index:', ctx.globalCompositeOperation);
                    xPosition += 350;
                } else {
                    console.log("Logo not available, drawing fallback text.");
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 20px Ruda';
                    ctx.textAlign = 'center';
                    ctx.fillText('Logo nicht geladen', xPosition + 100, canvas.height - 80);
                    xPosition += 350;
                }
            });

            // Generiertes Bild als Data-URL anzeigen
            console.log("Image generation completed.");
            const imageUrl = canvas.toDataURL('image/jpeg');
            $('#spielBild').attr('src', imageUrl).show();
        });
    };

    // Fehlerbehandlung, wenn das Hintergrundbild nicht geladen werden kann
    img.onerror = function() {
        console.error("Error loading background image.");
        alert("Fehler beim Laden des Hintergrundbildes.");
    };
}