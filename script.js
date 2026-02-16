document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    const addMessage = (content, sender = 'ai', isElement = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content');

        if (isElement) {
            contentDiv.appendChild(content);
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        const chatWindow = document.getElementById('chat-window');
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageDiv;
    };

    const createBookCard = (book) => {
        const card = document.createElement('div');
        card.className = 'book-card';

        const img = document.createElement('img');
        const coverId = book.cover_i;
        img.src = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';
        img.alt = book.title;
        img.onerror = () => {
            img.src = 'https://via.placeholder.com/80x120?text=Geen+Omslag';
            img.onerror = null; // Prevent infinite loop if placeholder fails
        };
        if (!coverId) img.onerror();

        const info = document.createElement('div');
        info.className = 'book-info';

        const h4 = document.createElement('h4');
        h4.textContent = book.title;

        const p = document.createElement('p');
        const author = book.author_name ? book.author_name.join(', ') : 'Onbekende auteur';
        const year = book.first_publish_year || 'Jaar onbekend';

        const emAuthor = document.createElement('em');
        emAuthor.textContent = author;
        p.appendChild(emAuthor);
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createTextNode(year));

        const link = document.createElement('a');
        link.href = `https://openlibrary.org${book.key}`;
        link.target = '_blank';
        link.className = 'lees-btn';
        link.textContent = 'Raadpleeg Collectie';

        info.appendChild(h4);
        info.appendChild(p);
        info.appendChild(link);
        card.appendChild(img);
        card.appendChild(info);

        return card;
    };

    const fetchBooks = async (query) => {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=3`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.docs;
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    };

    const handleSend = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        userInput.value = '';

        const thinkingTexts = [
            "Een uitstekende keuze. Een moment geduld alstublieft, terwijl ik de digitale archieven voor u raadpleeg...",
            "Interessant verzoek. Ik ga direct op zoek naar de meest relevante werken in onze collectie...",
            "Ah, een literair verzoek van niveau. Ik zal kijken wat de bibliotheek voor u in petto heeft..."
        ];
        const randomThinking = thinkingTexts[Math.floor(Math.random() * thinkingTexts.length)];
        const thinkingMsg = addMessage(randomThinking, 'ai');

        const books = await fetchBooks(text);

        // Remove thinking message
        thinkingMsg.remove();

        if (books && books.length > 0) {
            const intros = [
                `Met genoegen presenteer ik u enkele gerespecteerde werken die aansluiten bij uw interesse in "${text}":`,
                `Ik heb de volgende literaire schatten gevonden gerelateerd aan "${text}":`,
                `Deze werken over "${text}" zouden u wellicht kunnen bekoren:`
            ];
            const randomIntro = intros[Math.floor(Math.random() * intros.length)];
            addMessage(randomIntro, 'ai');

            books.forEach(book => {
                const bookCard = createBookCard(book);
                addMessage(bookCard, 'ai', true);
            });
        } else if (books) {
            addMessage("Mijn excuses, maar ik heb geen werken kunnen vinden die exact overeenkomen met uw verzoek. Heeft u wellicht een andere titel of auteur in gedachten?", 'ai');
        } else {
            addMessage("Het spijt me zeer, maar er is een probleem opgetreden bij het verbinden met de archieven. Probeert u het later nog eens.", 'ai');
        }
    };

    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
});
