document.addEventListener('DOMContentLoaded', function() {
    const checklist = document.getElementById('checklist');
    const cards = [
        "Card 1",
        "Card 2",
        "Card 3",
        // Add more cards as needed
    ];

    cards.forEach(card => {
        const li = document.createElement('li');
        li.textContent = card;
        li.addEventListener('click', function() {
            this.classList.toggle('completed');
        });
        checklist.appendChild(li);
    });
});
