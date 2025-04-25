function toggleAuth(formType, event) {
    // Empêcher le comportement par défaut du formulaire
    if (event) {
        event.preventDefault();
    }
    
    // Récupérer tous les cards
    const loginCard = document.getElementById("login-card");
    const registerCard = document.getElementById("register-card");
    const formationCard = document.getElementById("formation-card");
    const experCard = document.getElementById("exper-card");
    const competCard = document.getElementById("competence-card");
    
    // Cacher tous les formulaires
    loginCard.style.display = "none";
    registerCard.style.display = "none";
    formationCard.style.display = "none";
    experCard.style.display = "none";
    competCard.style.display = "none";
    
    // Afficher le bon formulaire
    switch(formType) {
        case "register":
            registerCard.style.display = "block";
            break;
        case "formation":
            formationCard.style.display = "block";
            break;
        case "experience":
            experCard.style.display = "block";
            break;
        case "competences":
            competCard.style.display = "block";
            break;
        default:
            loginCard.style.display = "block";
    }

    // Faire défiler vers le haut pour voir le formulaire sélectionné
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer qu'un seul formulaire est visible au chargement
    const loginCard = document.getElementById("login-card");
    const registerCard = document.getElementById("register-card");
    const formationCard = document.getElementById("formation-card");
    const experCard = document.getElementById("exper-card");
    const competCard = document.getElementById("competence-card");
    
    loginCard.style.display = "block";
    registerCard.style.display = "none";
    formationCard.style.display = "none";
    experCard.style.display = "none";
    competCard.style.display = "none";
    
    // Gestion des boutons de niveau de langue
    const langButtons = document.querySelectorAll('.c1');
    langButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Récupère tous les boutons du même groupe
            const parentButtons = this.parentElement.querySelectorAll('.c1');
            // Désactive tous les boutons du groupe
            parentButtons.forEach(btn => btn.classList.remove('active'));
            // Active le bouton cliqué
            this.classList.add('active');
        });
    });
});

// Ajouter cette fonction à votre script JavaScript existant
function ajouterCompetence() {
    // Récupérer le champ de saisie de compétence
    const competenceInput = document.querySelector('.compet-card .input-group input[type="text"]');
    const competence = competenceInput.value.trim();
    
    // Vérifier si la compétence n'est pas vide
    if (competence !== '') {
        // Créer un élément pour afficher la compétence
        const competencesList = document.getElementById('competences-list');
        
        // Si la liste n'existe pas encore, la créer
        if (!competencesList) {
            const newList = document.createElement('div');
            newList.id = 'competences-list';
            newList.className = 'competences-list';
            // Insérer la liste après le champ de saisie
            competenceInput.parentElement.after(newList);
        }
        
        // Créer l'élément de compétence
        const competenceItem = document.createElement('div');
        competenceItem.className = 'competence-item';
        
        // Ajouter le texte et un bouton de suppression
        competenceItem.innerHTML = `
            <span>${competence}</span>
            <button type="button" class="supprimer-competence" onclick="supprimerCompetence(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Ajouter à la liste
        document.getElementById('competences-list').appendChild(competenceItem);
        
        // Vider le champ de saisie
        competenceInput.value = '';
    }
}

// Fonction pour supprimer une compétence
function supprimerCompetence(button) {
    button.parentElement.remove();
}

// Ajouter ceci à votre fonction d'initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
 // Ajouter l'écouteur d'événement au bouton "Ajouter" des compétences
    const btnAjouterCompetence = document.querySelector('.compet-card .input-group .c1');
    if (btnAjouterCompetence) {
        btnAjouterCompetence.addEventListener('click', ajouterCompetence);
    }
    
    // Permettre l'ajout de compétence en appuyant sur Entrée
    const competenceInput = document.querySelector('.compet-card .input-group input[type="text"]');
    if (competenceInput) {
        competenceInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Empêcher la soumission du formulaire
                ajouterCompetence();
            }
        });
    }
});


function searchOffers() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.offre-card');
    let foundMatch = false; 
    cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        if (title.includes(input)) {
            card.style.display = 'block';
            foundMatch = true;
        } else {
            card.style.display = 'none';
        }
    });
    if (!foundMatch) {
        alert("Aucune offre ne correspond à votre recherche.");
    }
}

// Fonction pour initialiser les conteneurs de détails pour chaque offre
function initJobDetails() {
    // Récupération de toutes les offres
    const jobCards = document.querySelectorAll('.offre-card');
    
    // Pour chaque offre, créer un conteneur de détails on
    jobCards.forEach((card, index) => {
        const jobTitle = card.querySelector('h2').textContent;
        const jobLocation = card.querySelector('p').textContent.split('.')[0];
        const detailsBtn = card.querySelector('.details-btn');
        
        // Créer un conteneur pour chaque offre
        let containerId = `container-${index + 1}`;
        let container = document.createElement('div');
        container.id = containerId;
        container.className = 'detail-container';
        
        // Définir le contenu spécifique pour chaque offre
        container.innerHTML = `
            <main>
            <button class="close-btn">Fermer</button>

                <div class="offer-details">
                    <h2>${jobTitle}</h2>
                    <p class="location"><strong>Lieu :</strong> ${jobLocation}</p>
                    <p class="date"><strong>Date de publication :</strong> 07 Mars 2025</p>
        
                    <h3>Description du poste</h3>
                    <p>Description détaillée pour le poste ${jobTitle}.</p>
        
                    <h3>Missions principales</h3>
                    <ul>
                        <li>Mission 1 pour ${jobTitle}</li>
                        <li>Mission 2 pour ${jobTitle}</li>
                        <li>Mission 3 pour ${jobTitle}</li>
                        <li>Mission 4 pour ${jobTitle}</li>
                    </ul>
        
                    <h3>Profil recherché</h3>
                    <ul>
                        <li>Qualification 1 requise</li>
                        <li>Qualification 2 requise</li>
                        <li>Qualification 3 requise</li>
                        <li>Qualification 4 souhaitée</li>
                    </ul>
        
                    <button class="apply-button">Postuler</button>
                </div>
            </main>
        `;
        
        // Ajouter le conteneur au body
        document.body.appendChild(container);
        
        // Ajouter l'écouteur d'événement au bouton de détails
        detailsBtn.addEventListener('click', function(e) {
            // Fermer tous les autres conteneurs
            document.querySelectorAll('.detail-container').forEach(cont => {
                cont.classList.remove('active');
            });
            
            // Ouvrir ce conteneur
            container.classList.add('active');
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Fermer le conteneur actif au clic sur le fond
    document.getElementById('backgroundArea').addEventListener('click', function() {
        document.querySelectorAll('.detail-container').forEach(container => {
            container.classList.remove('active');
        });
    });

    container.querySelector('.close-btn').addEventListener('click', () => {
container.classList.remove('active');
document.getElementById('backgroundArea').style.display = 'none';
});

    
    // Empêcher la propagation des clics depuis les conteneurs
    document.querySelectorAll('.detail-container').forEach(container => {
        container.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
}

// Initialiser les détails d'offres au chargement de la page
window.addEventListener('DOMContentLoaded', initJobDetails);

document.addEventListener('DOMContentLoaded', function() {
    // Menu hamburger pour mobile
    const hamburger = document.querySelector('.hamburger');
    const menu = document.getElementById('menu');
    
    hamburger.addEventListener('click', function() {
        menu.classList.toggle('active');
    });

    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    const responseMessage = document.getElementById('responseMessage');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validation du formulaire
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Validation simple
        if (!name || !email || !phone || !subject || !message) {
            showResponse('Veuillez remplir tous les champs du formulaire.', 'error');
            return;
        }
        
        // Validation de l'email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showResponse('Veuillez entrer une adresse email valide.', 'error');
            return;
        }
        
        // Validation du téléphone (format algérien simplifié)
        const phonePattern = /^(0|\+213|00213)?[567]\d{8}$/;
        if (!phonePattern.test(phone)) {
            showResponse('Veuillez entrer un numéro de téléphone valide.', 'error');
            return;
        }
        
        // Simulation d'envoi de formulaire
        // En production, remplacez cette partie par votre code AJAX pour envoyer les données au serveur
        setTimeout(function() {
            showResponse('Votre message a été envoyé avec succès. Notre équipe vous contactera bientôt.', 'success');
            contactForm.reset();
        }, 1000);
    });
    
    function showResponse(message, type) {
        responseMessage.textContent = message;
        responseMessage.className = 'response-message ' + type;
        responseMessage.style.display = 'block';
        
        // Faire défiler jusqu'au message de réponse
        responseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Masquer le message après 5 secondes
        setTimeout(function() {
            responseMessage.style.display = 'none';
        }, 5000);
    }
});