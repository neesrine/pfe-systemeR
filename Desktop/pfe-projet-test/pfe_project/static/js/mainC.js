function openModal() {
    // Load current values into form
    document.getElementById('lastName').value = document.getElementById('currentLastName').textContent;
    document.getElementById('firstName').value = document.getElementById('currentFirstName').textContent;
    document.getElementById('birthDate').value = formatDateForInput(document.getElementById('currentBirthDate').textContent);
    document.getElementById('phone').value = document.getElementById('currentPhone').textContent;
    document.getElementById('email').value = document.getElementById('currentEmail').textContent;
    document.getElementById('address').value = document.getElementById('currentAddress').textContent;
    document.getElementById('jobTitle').value = document.getElementById('currentJob').textContent;
    document.getElementById('description').value = document.getElementById('currentDescription').textContent;
    
    // Set photo preview
    document.getElementById('photoPreview').src = document.getElementById('currentProfilePhoto').src;
    
    // Show modal
    document.getElementById('profileModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('profileModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Format date from DD/MM/YYYY to YYYY-MM-DD for input
function formatDateForInput(dateStr) {
    const parts = dateStr.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

// Photo Upload Preview
document.getElementById('photoUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('La taille du fichier ne doit pas dépasser 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

// Save Profile Function
function saveProfile() {
    // Update profile photo
    const photoPreview = document.getElementById('photoPreview').src;
    if (photoPreview) {
        document.getElementById('currentProfilePhoto').src = photoPreview;
    }
    
    // Update personal info
    document.getElementById('currentLastName').textContent = document.getElementById('lastName').value;
    document.getElementById('currentFirstName').textContent = document.getElementById('firstName').value;
    document.getElementById('currentName').textContent = 
        document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
    
    // Format date from YYYY-MM-DD to DD/MM/YYYY
    const birthDate = new Date(document.getElementById('birthDate').value);
    const formattedDate = `${birthDate.getDate().toString().padStart(2, '0')}/${(birthDate.getMonth()+1).toString().padStart(2, '0')}/${birthDate.getFullYear()}`;
    document.getElementById('currentBirthDate').textContent = formattedDate;
    
    // Update contact info
    document.getElementById('currentPhone').textContent = document.getElementById('phone').value;
    document.getElementById('currentEmail').textContent = document.getElementById('email').value;
    
    // Update address
    document.getElementById('currentAddress').textContent = document.getElementById('address').value;
    
    // Update job info
    document.getElementById('currentJob').textContent = document.getElementById('jobTitle').value;
    document.getElementById('currentDescription').textContent = document.getElementById('description').value;
    
    // Update languages
    document.getElementById('currentArabic').textContent = document.getElementById('arabic').value;
    document.getElementById('currentFrench').textContent = document.getElementById('french').value;
    document.getElementById('currentEnglish').textContent = document.getElementById('english').value;
    
    // Update skills
    const skillsContainer = document.getElementById('currentSkills');
    skillsContainer.innerHTML = '';
    const skills = document.getElementById('skills').value.split(',');
    skills.forEach(skill => {
        if (skill.trim()) {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill.trim();
            skillsContainer.appendChild(skillTag);
        }
    });
    
    closeModal();
    alert('Profil mis à jour avec succès!');
}
/************offresCandidat.html**************** */

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
/********mesCandidat.html************** */
document.addEventListener('DOMContentLoaded', function() {
    const filterBtn = document.querySelector('.filter-btn');
    const filterContent = document.querySelector('.filter-dropdown-content');
    const filterOptions = document.querySelectorAll('.filter-option');
    const applicationCards = document.querySelectorAll('.application-card');

    // Initialize with all applications showing
    filterApplications('all');

    filterBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      filterContent.classList.toggle('show');
      this.classList.toggle('active');
    });

    filterOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Remove active class from all options
        filterOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked option
        this.classList.add('active');
        
        // Update button text
        filterBtn.querySelector('span').textContent = this.textContent;
        
        // Close dropdown
        filterContent.classList.remove('show');
        filterBtn.classList.remove('active');
        
        // Filter applications based on status
        const status = this.dataset.status;
        filterApplications(status);
      });
    });

    function filterApplications(status) {
      applicationCards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!filterBtn.contains(e.target)) {
        filterContent.classList.remove('show');
        filterBtn.classList.remove('active');
      }
    });
  });