   // Sélectionner les éléments nécessaires
   const searchInput = document.querySelector('.search-bar input');
   const departmentSelect = document.querySelector('.filter-options select:nth-child(1)');
   const positionSelect = document.querySelector('.filter-options select:nth-child(2)');
   const statusSelect = document.querySelector('.filter-options select:nth-child(3)');
   const candidateRows = document.querySelectorAll('tbody tr');
   const addButton = document.querySelector('.add-button');
   const actionButtons = document.querySelectorAll('.action-btn');
   const paginationButtons = document.querySelectorAll('.page-btn');
   const prevButton = document.querySelector('.page-btn.prev');
   const nextButton = document.querySelector('.page-btn.next');
   const pageNumbers = Array.from(document.querySelectorAll('.page-btn:not(.prev):not(.next)'));
   
   // Variables pour la pagination
   const rowsPerPage = 5;
   let currentPage = 1;
   let filteredRows = Array.from(candidateRows);
   
   // Fonction principale de filtrage
   function filterTable() {
       const searchText = searchInput.value.toLowerCase();
       const department = departmentSelect.value;
       const position = positionSelect.value;
       const status = statusSelect.value;
       
       // Réinitialiser les lignes filtrées
       filteredRows = Array.from(candidateRows).filter(row => {
           // Récupérer les données de la ligne
           const rowName = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
           const rowPosition = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
           const rowDepartment = row.querySelector('td:nth-child(3)').textContent.trim();
           const rowStatus = row.querySelector('.status').textContent.trim();
           
           // Vérifier si la recherche correspond à une colonne quelconque
           const matchesSearch = rowName.includes(searchText) || 
                                rowPosition.includes(searchText) || 
                                rowDepartment.toLowerCase().includes(searchText);
           
           // Vérifier les correspondances de filtres
           const matchesDepartment = department === 'Tous les départements' || rowDepartment === department;
           const matchesPosition = position === 'Tous les postes' || rowPosition === position.toLowerCase();
           const matchesStatus = status === 'Tous les statuts' || rowStatus === status;
           
           return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
       });
       
       // Réinitialiser à la première page après filtrage
       currentPage = 1;
       
       // Appliquer la pagination sur les résultats filtrés
       updateTableDisplay();
   }
   
   // Fonction pour mettre à jour l'affichage de la table
   function updateTableDisplay() {
       // Masquer toutes les lignes d'abord
       candidateRows.forEach(row => row.style.display = 'none');
       
       // Calculer les indices pour la pagination
       const startIndex = (currentPage - 1) * rowsPerPage;
       const endIndex = Math.min(startIndex + rowsPerPage, filteredRows.length);
       
       // Afficher uniquement les lignes de la page actuelle
       for (let i = startIndex; i < endIndex; i++) {
           if (filteredRows[i]) {
               filteredRows[i].style.display = '';
           }
       }
       
       // Mettre à jour les contrôles de pagination
       updatePaginationControls();
   }
   
   // Fonction pour mettre à jour les contrôles de pagination
   function updatePaginationControls() {
       const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
   
       // Mettre à jour l'état des boutons de pagination
       pageNumbers.forEach(button => {
           const pageNum = parseInt(button.textContent);
           button.classList.toggle('active', pageNum === currentPage);
           
           // N'afficher que les boutons pertinents
           if (totalPages <= 5) {
               // Si peu de pages, montrer tous les boutons jusqu'au total
               button.style.display = pageNum <= totalPages ? '' : 'none';
           } else {
               // Pour beaucoup de pages, montrer 1, la page courante et ses voisines, et la dernière page
               if (pageNum === 1 || pageNum === totalPages || 
                   Math.abs(pageNum - currentPage) <= 1) {
                   button.style.display = '';
               } else {
                   button.style.display = 'none';
               }
           }
       });
       
       // Mettre à jour l'état des boutons précédent/suivant
       prevButton.disabled = currentPage === 1;
       nextButton.disabled = currentPage >= totalPages;
       
       // Gérer l'affichage de l'ellipse
       const ellipsis = document.querySelector('.ellipsis');
       if (ellipsis) {
           ellipsis.style.display = (totalPages > 5 && currentPage < totalPages - 2) ? '' : 'none';
       }
   }
   
   // Fonction pour changer de page
   function changePage(newPage) {
       const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
       
       // Vérifier que la nouvelle page est valide
       if (newPage >= 1 && newPage <= totalPages) {
           currentPage = newPage;
           updateTableDisplay();
       }
   }
   
   // Fonction pour mettre à jour les options de poste en fonction du département sélectionné
   function updatePositionOptions() {
       const selectedDepartment = departmentSelect.value;
       const positionsSet = new Set();
   
       candidateRows.forEach(row => {
           const rowDepartment = row.querySelector('td:nth-child(3)').textContent.trim();
           const rowPosition = row.querySelector('td:nth-child(2)').textContent.trim();
   
           if (selectedDepartment === 'Tous les départements' || rowDepartment === selectedDepartment) {
               positionsSet.add(rowPosition);
           }
       });
   
       // Sauvegarder la valeur actuelle
       const currentValue = positionSelect.value;
       
       // Vider les options actuelles
       positionSelect.innerHTML = '';
   
       // Ajouter "Tous les postes"
       const allOption = document.createElement('option');
       allOption.textContent = 'Tous les postes';
       positionSelect.appendChild(allOption);
   
       // Ajouter les nouveaux postes
       Array.from(positionsSet).sort().forEach(position => {
           const option = document.createElement('option');
           option.textContent = position;
           positionSelect.appendChild(option);
       });
       
       // Si le poste précédemment sélectionné existe encore dans les options, le resélectionner
       if (Array.from(positionsSet).includes(currentValue)) {
           positionSelect.value = currentValue;
       }
   }
   
   // Fonction pour mettre à jour les options de département en fonction du poste sélectionné
   function updateDepartmentOptions() {
       const selectedPosition = positionSelect.value;
       const departmentsSet = new Set();
   
       candidateRows.forEach(row => {
           const rowPosition = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
           const rowDepartment = row.querySelector('td:nth-child(3)').textContent.trim();
   
           if (selectedPosition === 'Tous les postes' || rowPosition === selectedPosition.toLowerCase()) {
               departmentsSet.add(rowDepartment);
           }
       });
   
       // Sauvegarder la valeur actuelle
       const currentValue = departmentSelect.value;
       
       // Vider les options actuelles
       departmentSelect.innerHTML = '';
   
       // Ajouter "Tous les départements"
       const allOption = document.createElement('option');
       allOption.textContent = 'Tous les départements';
       departmentSelect.appendChild(allOption);
   
       // Ajouter les nouveaux départements
       Array.from(departmentsSet).sort().forEach(department => {
           const option = document.createElement('option');
           option.textContent = department;
           departmentSelect.appendChild(option);
       });
   
       // Si le département précédemment sélectionné existe encore dans les options, le resélectionner
       if (Array.from(departmentsSet).includes(currentValue)) {
           departmentSelect.value = currentValue;
       }
   }
   
   // Ajouter les gestionnaires d'événements pour les filtres
   searchInput.addEventListener('input', filterTable);
   
   departmentSelect.addEventListener('change', () => {
       updatePositionOptions(); // met à jour la liste des postes selon le département
       filterTable();           // puis filtre le tableau
   });
   
   positionSelect.addEventListener('change', () => {
       updateDepartmentOptions(); // met à jour la liste des départements selon le poste
       filterTable();             // puis filtre le tableau
   });
   
   statusSelect.addEventListener('change', filterTable);
   
   // Ajouter les gestionnaires d'événements pour la pagination
   prevButton.addEventListener('click', () => changePage(currentPage - 1));
   nextButton.addEventListener('click', () => changePage(currentPage + 1));
   
   pageNumbers.forEach(button => {
       button.addEventListener('click', function() {
           const pageNum = parseInt(this.textContent);
           if (!isNaN(pageNum)) {
               changePage(pageNum);
           }
       });
   });
   
   // Sélectionner les éléments nécessaires
   document.addEventListener('DOMContentLoaded', function() {
       const searchInput = document.querySelector('.search-bar input');
       const departmentSelect = document.querySelector('.filter-options select:nth-child(1)');
       const positionSelect = document.querySelector('.filter-options select:nth-child(2)');
       const statusSelect = document.querySelector('.filter-options select:nth-child(3)');
       const candidateRows = document.querySelectorAll('tbody tr');
       const addButton = document.querySelector('.add-button');
       const paginationButtons = document.querySelectorAll('.page-btn');
       const prevButton = document.querySelector('.page-btn.prev');
       const nextButton = document.querySelector('.page-btn.next');
       const pageNumbers = Array.from(document.querySelectorAll('.page-btn:not(.prev):not(.next)'));
   
       // Variables pour la pagination
       const rowsPerPage = 5;
       let currentPage = 1;
       let filteredRows = Array.from(candidateRows);
       
       // Tableau pour stocker les éléments supprimés
       const deletedCandidates = [];
       
       // Délai avant que la suppression ne soit définitive (en millisecondes)
       const deletionDelay = 10000; // 10 secondes
   
       // Fonction principale de filtrage
       function filterTable() {
           const searchText = searchInput.value.toLowerCase();
           const department = departmentSelect.value;
           const position = positionSelect.value;
           const status = statusSelect.value;
           
           // Réinitialiser les lignes filtrées
           filteredRows = Array.from(candidateRows).filter(row => {
               // Récupérer les données de la ligne
               const rowName = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
               const rowPosition = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
               const rowDepartment = row.querySelector('td:nth-child(3)').textContent.trim();
               const rowStatus = row.querySelector('.status').textContent.trim();
               
               // Vérifier si la recherche correspond à une colonne quelconque
               const matchesSearch = rowName.includes(searchText) || 
                                   rowPosition.includes(searchText) || 
                                   rowDepartment.toLowerCase().includes(searchText);
               
               // Vérifier les correspondances de filtres
               const matchesDepartment = department === 'Tous les départements' || rowDepartment === department;
               const matchesPosition = position === 'Tous les postes' || rowPosition === position.toLowerCase();
               const matchesStatus = status === 'Tous les statuts' || rowStatus === status;
               
               return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
           });
           
           // Réinitialiser à la première page après filtrage
           currentPage = 1;
           
           // Appliquer la pagination sur les résultats filtrés
           updateTableDisplay();
       }
   
       // Fonction pour mettre à jour l'affichage de la table
       function updateTableDisplay() {
           // Masquer toutes les lignes d'abord
           candidateRows.forEach(row => row.style.display = 'none');
           
           // Calculer les indices pour la pagination
           const startIndex = (currentPage - 1) * rowsPerPage;
           const endIndex = Math.min(startIndex + rowsPerPage, filteredRows.length);
           
           // Afficher uniquement les lignes de la page actuelle
           for (let i = startIndex; i < endIndex; i++) {
               if (filteredRows[i]) {
                   filteredRows[i].style.display = '';
               }
           }
           
           // Mettre à jour les contrôles de pagination
           updatePaginationControls();
       }
   
       // Fonction pour mettre à jour les contrôles de pagination
       function updatePaginationControls() {
           const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
   
           // Mettre à jour l'état des boutons de pagination
           pageNumbers.forEach(button => {
               const pageNum = parseInt(button.textContent);
               button.classList.toggle('active', pageNum === currentPage);
               
               // N'afficher que les boutons pertinents
               if (totalPages <= 5) {
                   // Si peu de pages, montrer tous les boutons jusqu'au total
                   button.style.display = pageNum <= totalPages ? '' : 'none';
               } else {
                   // Pour beaucoup de pages, montrer 1, la page courante et ses voisines, et la dernière page
                   if (pageNum === 1 || pageNum === totalPages || 
                       Math.abs(pageNum - currentPage) <= 1) {
                       button.style.display = '';
                   } else {
                       button.style.display = 'none';
                   }
               }
           });
           
           // Mettre à jour l'état des boutons précédent/suivant
           prevButton.disabled = currentPage === 1;
           nextButton.disabled = currentPage >= totalPages;
           
           // Gérer l'affichage de l'ellipse
           const ellipsis = document.querySelector('.ellipsis');
           if (ellipsis) {
               ellipsis.style.display = (totalPages > 5 && currentPage < totalPages - 2) ? '' : 'none';
           }
       }
   
       // Fonction pour changer de page
       function changePage(newPage) {
           const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
           
           // Vérifier que la nouvelle page est valide
           if (newPage >= 1 && newPage <= totalPages) {
               currentPage = newPage;
               updateTableDisplay();
           }
       }
   
       // Fonction pour mettre à jour les options de poste en fonction du département sélectionné
       function updatePositionOptions() {
           const selectedDepartment = departmentSelect.value;
           const positionsSet = new Set();
   
           candidateRows.forEach(row => {
               const rowDepartment = row.querySelector('td:nth-child(3)').textContent.trim();
               const rowPosition = row.querySelector('td:nth-child(2)').textContent.trim();
   
               if (selectedDepartment === 'Tous les départements' || rowDepartment === selectedDepartment) {
                   positionsSet.add(rowPosition);
               }
           });
   
           // Sauvegarder la valeur actuelle
           const currentValue = positionSelect.value;
           
           // Vider les options actuelles
           positionSelect.innerHTML = '';
   
           // Ajouter "Tous les postes"
           const allOption = document.createElement('option');
           allOption.textContent = 'Tous les postes';
           positionSelect.appendChild(allOption);
   
           // Ajouter les nouveaux postes
           Array.from(positionsSet).sort().forEach(position => {
               const option = document.createElement('option');
               option.textContent = position;
               positionSelect.appendChild(option);
           });
           
           // Si le poste précédemment sélectionné existe encore dans les options, le resélectionner
           if (Array.from(positionsSet).includes(currentValue)) {
               positionSelect.value = currentValue;
           }
       }
   
       // Fonction pour mettre à jour les options de département en fonction du poste sélectionné
       function updateDepartmentOptions() {
           const selectedPosition = positionSelect.value;
           const departmentsSet = new Set();
   
           candidateRows.forEach(row => {
               const rowPosition = row.querySelector('td:nth-child(2)').textContent.trim().toLowerCase();
               const rowDepartment = row.querySelector('td:nth-child(3)').textContent.trim();
   
               if (selectedPosition === 'Tous les postes' || rowPosition === selectedPosition.toLowerCase()) {
                   departmentsSet.add(rowDepartment);
               }
           });
   
           // Sauvegarder la valeur actuelle
           const currentValue = departmentSelect.value;
           
           // Vider les options actuelles
           departmentSelect.innerHTML = '';
   
           // Ajouter "Tous les départements"
           const allOption = document.createElement('option');
           allOption.textContent = 'Tous les départements';
           departmentSelect.appendChild(allOption);
   
           // Ajouter les nouveaux départements
           Array.from(departmentsSet).sort().forEach(department => {
               const option = document.createElement('option');
               option.textContent = department;
               departmentSelect.appendChild(option);
           });
   
           // Si le département précédemment sélectionné existe encore dans les options, le resélectionner
           if (Array.from(departmentsSet).includes(currentValue)) {
               departmentSelect.value = currentValue;
           }
       }
   
       // Créer et ajouter un bouton d'annulation au-dessus du tableau
       const actionBar = document.createElement('div');
       actionBar.style.cssText = 'margin: 10px 0; text-align: right;';
       actionBar.innerHTML = '<button id="undo-btn" style="padding: 8px 12px; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;" disabled><i class="fas fa-undo"></i> Annuler la dernière suppression</button>';
       
       // Insérer le bouton avant le tableau contenant les candidats
       const table = document.querySelector('tr').closest('table');
       table.parentNode.insertBefore(actionBar, table);
       
       const undoButton = document.getElementById('undo-btn');
   
       // Fonction pour créer une notification
       function createNotification(message, type = 'info', parent) {
           const notification = document.createElement('div');
           notification.className = `notification notification-${type}`;
           notification.innerHTML = `
               <span>${message}</span>
               ${type === 'warning' ? '<button class="btn-undo">Annuler</button>' : ''}
           `;
           
           // Ajouter la notification après la ligne du candidat
           const targetRow = parent.closest('tr');
           const notificationRow = document.createElement('tr');
           const notificationCell = document.createElement('td');
           notificationCell.colSpan = targetRow.cells.length;
           notificationCell.appendChild(notification);
           notificationRow.appendChild(notificationCell);
           notificationRow.className = 'notification-row';
           
           targetRow.parentNode.insertBefore(notificationRow, targetRow.nextSibling);
           
           // Ajouter un écouteur d'événement au bouton d'annulation si présent
           const undoButton = notification.querySelector('.btn-undo');
           if (undoButton) {
               undoButton.addEventListener('click', function() {
                   undoLastDeletion();
                   notificationRow.remove();
               });
           }
           
           // Supprimer automatiquement la notification après un délai
           setTimeout(() => {
               notificationRow.classList.add('fade-out');
               setTimeout(() => notificationRow.remove(), 500);
           }, deletionDelay - 500);
           
           return notification;
       }
   
       // Ajouter un nouveau bouton "refuser" et "programmer entretien" à chaque ligne
       const rows = document.querySelectorAll('tbody tr');
       rows.forEach(row => {
           const actionsCell = row.querySelector('.actions');
           if (actionsCell) {
               // Créer le bouton refuser
               const refuseButton = document.createElement('button');
               refuseButton.className = 'action-btn refuse';
               refuseButton.innerHTML = '<i class="fas fa-times"></i>';
               refuseButton.title = 'Refuser';
               
               // Créer le bouton programmer entretien
               const scheduleButton = document.createElement('button');
               scheduleButton.className = 'action-btn schedule';
               scheduleButton.innerHTML = '<i class="fas fa-calendar-alt"></i>';
               scheduleButton.title = 'Programmer un entretien';
               
               // Insérer les boutons
               const deleteButton = actionsCell.querySelector('.action-btn.delete');
               if (deleteButton) {
                   actionsCell.insertBefore(scheduleButton, deleteButton);
                   actionsCell.insertBefore(refuseButton, deleteButton);
               } else {
                   actionsCell.appendChild(refuseButton);
                   actionsCell.appendChild(scheduleButton);
               }
           }
       });
   
       // Récupérer tous les boutons d'action
       const viewButtons = document.querySelectorAll('.action-btn.view');
       const refuseButtons = document.querySelectorAll('.action-btn.refuse');
       const scheduleButtons = document.querySelectorAll('.action-btn.schedule');
       const deleteButtons = document.querySelectorAll('.action-btn.delete');
   
       // Fonction pour accepter un candidat
       function acceptCandidate(candidateRow, button) {
           // Changer le statut à "Accepté"
           const statusCell = candidateRow.querySelector('.status');
           statusCell.textContent = 'Accepté';
           statusCell.className = 'status accepted';
           
           // Désactiver le bouton d'acceptation
           button.disabled = true;
           button.classList.add('disabled');
           
           // Afficher une notification
           createNotification('Candidat accepté. Vous pouvez maintenant programmer un entretien.', 'success', candidateRow);
       }
   
       // Fonction pour refuser un candidat
       function refuseCandidate(candidateRow, button) {
           // Changer le statut à "Refusé"
           const statusCell = candidateRow.querySelector('.status');
           statusCell.textContent = 'Refusé';
           statusCell.className = 'status rejected';
           
           // Afficher une notification
           createNotification('Candidat refusé.', 'info', candidateRow);
       }
   
       // Fonction pour programmer un entretien
       function scheduleInterview(candidateRow) {
           const candidateName = candidateRow.querySelector('.candidate-info .name').textContent;
           
           // Ouvrir la fenêtre modale pour programmer un entretien
           document.getElementById('interview-modal').style.display = 'block';
           document.getElementById('candidate-name').textContent = candidateName;
           
           setTimeout(() => {
               document.getElementById('interview-modal').classList.add('show');
           }, 10);
       }
   
       // Fonction pour supprimer un candidat
       function deleteCandidate(candidateRow) {
           // Si la ligne est déjà marquée pour suppression
           if (candidateRow.classList.contains('pending-deletion')) {
               return;
           }
           
           // Stocker les données de la ligne pour une annulation possible
           const rowData = {
               element: candidateRow,
               parent: candidateRow.parentNode,
               position: Array.from(candidateRow.parentNode.children).indexOf(candidateRow),
               timeoutId: null
           };
           
           // Ajouter l'effet visuel de suppression en attente
           candidateRow.classList.add('pending-deletion');
           
           // Créer une notification avec bouton d'annulation
           createNotification(
               'Cette candidature sera supprimée dans 10 secondes', 
               'warning', 
               candidateRow
           );
           
           // Définir un délai avant la suppression définitive
           rowData.timeoutId = setTimeout(() => {
               // Supprimer la ligne de candidature
               candidateRow.remove();
               
               // Supprimer l'élément du tableau des suppressions en attente
               const index = deletedCandidates.findIndex(item => item.element === candidateRow);
               if (index !== -1) {
                   deletedCandidates.splice(index, 1);
               }
               
               // Créer une notification de confirmation flottante
               const confirmNotification = document.createElement('div');
               confirmNotification.className = 'floating-notification notification-success';
               confirmNotification.innerHTML = '<span>La candidature a été supprimée</span>';
               document.body.appendChild(confirmNotification);
               
               setTimeout(() => {
                   confirmNotification.classList.add('fade-out');
                   setTimeout(() => confirmNotification.remove(), 500);
               }, 3000);
               
               // Mettre à jour l'affichage après suppression
               filterTable();
           }, deletionDelay);
           
           // Ajouter aux éléments supprimés pour permettre l'annulation
           deletedCandidates.push(rowData);
           
           // Activer le bouton d'annulation
           undoButton.disabled = false;
       }
   
       // Fonction pour annuler la dernière suppression
       function undoLastDeletion() {
           if (deletedCandidates.length === 0) return;
           
           // Récupérer le dernier élément supprimé
           const lastDeleted = deletedCandidates.pop();
           
           // Annuler le délai de suppression
           clearTimeout(lastDeleted.timeoutId);
           
           // Restaurer l'élément à sa position d'origine
           lastDeleted.element.classList.remove('pending-deletion');
           
           // Réinsérer la ligne à sa position d'origine si possible
           if (lastDeleted.position >= lastDeleted.parent.children.length) {
               lastDeleted.parent.appendChild(lastDeleted.element);
           } else {
               lastDeleted.parent.insertBefore(lastDeleted.element, lastDeleted.parent.children[lastDeleted.position]);
           }
           
           // Désactiver le bouton si l'historique est vide
           if (deletedCandidates.length === 0) {
               undoButton.disabled = true;
           }
           
           // Créer une notification de confirmation flottante
           const confirmNotification = document.createElement('div');
           confirmNotification.className = 'floating-notification notification-success';
           confirmNotification.innerHTML = '<span>La suppression a été annulée</span>';
           document.body.appendChild(confirmNotification);
           
           setTimeout(() => {
               confirmNotification.classList.add('fade-out');
               setTimeout(() => confirmNotification.remove(), 500);
           }, 3000);
           
           // Mettre à jour l'affichage après restauration
           filterTable();
       }
   
       // Gestion du formulaire d'entretien
       function handleInterviewFormSubmission(e) {
           e.preventDefault();
           
           const candidateName = document.getElementById('candidate-name').textContent;
           const interviewDate = document.getElementById('interview-date').value;
           const interviewTime = document.getElementById('interview-time').value;
           const interviewer = document.getElementById('interviewer').value;
           
           // Traiter les données
           alert(`Entretien programmé pour ${candidateName} le ${interviewDate} à ${interviewTime} avec ${interviewer}`);
           
           // Marquer visuellement que l'entretien est programmé
           document.querySelectorAll('tbody tr').forEach(row => {
               const name = row.querySelector('.candidate-info .name');
               if (name && name.textContent === candidateName) {
                   const statusCell = row.querySelector('.status');
                   statusCell.className = 'status interview';
                   statusCell.textContent = 'Entretien prévu';
                   
                   // Créer un élément pour afficher la date d'entretien
                   const interviewInfo = document.createElement('div');
                   interviewInfo.className = 'interview-date';
                   interviewInfo.textContent = `Entretien: ${interviewDate} à ${interviewTime}`;
                   
                   // Ajouter l'élément après le statut s'il n'existe pas déjà
                   if (!statusCell.parentNode.querySelector('.interview-date')) {
                       statusCell.parentNode.appendChild(interviewInfo);
                   }
               }
           });
           
           // Fermer la fenêtre modale
           document.getElementById('interview-modal').classList.remove('show');
           setTimeout(() => {
               document.getElementById('interview-modal').style.display = 'none';
           }, 300);
           
           // Afficher une notification
           createNotification(`Entretien programmé pour le ${interviewDate} à ${interviewTime}`, 'success', 
               document.querySelector(`tr .candidate-info .name:contains('${candidateName}')`).closest('tr'));
       }
   
       // Ajouter les écouteurs d'événements pour les filtres
       searchInput.addEventListener('input', filterTable);
       
       departmentSelect.addEventListener('change', () => {
           updatePositionOptions();
           filterTable();
       });
       
       positionSelect.addEventListener('change', () => {
           updateDepartmentOptions();
           filterTable();
       });
       
       statusSelect.addEventListener('change', filterTable);
       
       // Ajouter les écouteurs d'événements pour la pagination
       prevButton.addEventListener('click', () => changePage(currentPage - 1));
       nextButton.addEventListener('click', () => changePage(currentPage + 1));
       
       pageNumbers.forEach(button => {
           button.addEventListener('click', function() {
               const pageNum = parseInt(this.textContent);
               if (!isNaN(pageNum)) {
                   changePage(pageNum);
               }
           });
       });
   
       // Ajouter les écouteurs d'événements aux boutons d'action
       viewButtons.forEach(button => {
           button.addEventListener('click', function() {
               const candidateRow = this.closest('tr');
               acceptCandidate(candidateRow, this);
           });
       });
       
       refuseButtons.forEach(button => {
           button.addEventListener('click', function() {
               const candidateRow = this.closest('tr');
               refuseCandidate(candidateRow, this);
           });
       });
       
       scheduleButtons.forEach(button => {
           button.addEventListener('click', function() {
               const candidateRow = this.closest('tr');
               scheduleInterview(candidateRow);
           });
       });
       
       deleteButtons.forEach(button => {
           button.addEventListener('click', function() {
               if(confirm('Êtes-vous sûr de vouloir supprimer ce candidat?')) {
                   const candidateRow = this.closest('tr');
                   deleteCandidate(candidateRow);
               }
           });
       });
   
       // Gestion de la modale d'entretien
       const closeModalButton = document.querySelector('.close-modal');
       if (closeModalButton) {
           closeModalButton.addEventListener('click', function() {
               document.getElementById('interview-modal').classList.remove('show');
               setTimeout(() => {
                   document.getElementById('interview-modal').style.display = 'none';
               }, 300);
           });
       }
   
       // Fermer la fenêtre modale en cliquant en dehors
       window.addEventListener('click', function(event) {
           const modal = document.getElementById('interview-modal');
           if (event.target == modal) {
               modal.classList.remove('show');
               setTimeout(() => {
                   modal.style.display = 'none';
               }, 300);
           }
       });
   
       // Gestionnaire pour le formulaire d'entretien
       const interviewForm = document.getElementById('interview-form');
       if (interviewForm) {
           interviewForm.addEventListener('submit', handleInterviewFormSubmission);
       }
   
       // Helper pour la sélection jQuery-like
       if (!Element.prototype.matches) {
           Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
       }
       
       if (!Element.prototype.closest) {
           Element.prototype.closest = function(s) {
               let el = this;
               do {
                   if (el.matches(s)) return el;
                   el = el.parentElement || el.parentNode;
               } while (el !== null && el.nodeType === 1);
               return null;
           };
       }
       
       // Ajouter le CSS pour les notifications et les animations
       const style = document.createElement('style');
       style.textContent = `
           /* Styles pour les notifications */
           .notification {
               padding: 10px 15px;
               margin: 5px 0;
               border-radius: 4px;
               display: flex;
               justify-content: space-between;
               align-items: center;
               animation: slideIn 0.3s ease-out;
           }
           
           .notification-row td {
               padding: 0;
           }
           
           .notification-info {
               background-color: #e3f2fd;
               border-left: 4px solid #2196f3;
               color: #0d47a1;
           }
           
           .notification-warning {
               background-color: #fff8e1;
               border-left: 4px solid #ffc107;
               color: #ff6f00;
           }
           
           .notification-success {
               background-color: #e8f5e9;
               border-left: 4px solid #4caf50;
               color: #1b5e20;
           }
           
           .btn-undo {
               background-color: transparent;
               border: 1px solid currentColor;
               border-radius: 3px;
               padding: 3px 8px;
               cursor: pointer;
               font-size: 0.8em;
               transition: all 0.2s;
           }
           
           .btn-undo:hover {
               background-color: rgba(0, 0, 0, 0.1);
           }
           
           /* Styles pour les lignes en attente de suppression */
           .pending-deletion {
               opacity: 0.5;
               position: relative;
           }
           
           .pending-deletion::after {
               content: "";
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               bottom: 0;
               background-color: rgba(255, 0, 0, 0.1);
               z-index: 1;
               pointer-events: none;
           }
           
           /* Styles pour les dates d'entretien et statuts */
           .interview-date {
               font-size: 0.8em;
               color: #777;
               margin-top: 5px;
           }
           
           .action-btn.disabled {
               opacity: 0.5;
               cursor: not-allowed;
           }
           
           .status.accepted {
               background-color: #e8f5e9;
               color: #2e7d32;
           }
           
           .status.rejected {
               background-color: #ffebee;
               color: #c62828;
           }
           
           .status.interview {
               background-color: #e3f2fd;
               color: #1565c0;
           }
           
           /* Styles pour les notifications flottantes */
           .floating-notification {
               position: fixed;
               top: 20px;
               right: 20px;
               z-index: 1000;
               padding: 10px 15px;
               border-radius: 4px;
               box-shadow: 0 3px 10px rgba(0,0,0,0.2);
               animation: slideInRight 0.3s ease-out;
           }
           
           .fade-out {
               animation: fadeOut 0.5s forwards;
           }
           
           /* Animations */
           @keyframes slideIn {
               from { transform: translateY(-10px); opacity: 0; }
               to { transform: translateY(0); opacity: 1; }
           }
           
           @keyframes slideInRight {
               from { transform: translateX(50px); opacity: 0; }
               to { transform: translateX(0); opacity: 1; }
           }
           
           @keyframes fadeOut {
               from { opacity: 1; }
               to { opacity: 0; }
           }
           
           /* Style pour le bouton de programmation d'entretien */
           .action-btn.schedule {
               background-color: #2196f3;
               color: white;
           }
           
           .action-btn.schedule:hover {
               background-color: #1976d2;
           }
           
           /* Styles pour la modale */
           #interview-modal {
               display: none;
               position: fixed;
               z-index: 1000;
               left: 0;
               top: 0;
               width: 100%;
               height: 100%;
               background-color: rgba(0, 0, 0, 0.5);
               opacity: 0;
               transition: opacity 0.3s ease;
           }
           
           #interview-modal.show {
               opacity: 1;
           }
           
           .modal-content {
               background-color: white;
               margin: 10% auto;
               padding: 20px;
               border-radius: 5px;
               width: 50%;
               max-width: 500px;
               box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
               transform: translateY(-20px);
               transition: transform 0.3s ease;
           }
           
           #interview-modal.show .modal-content {
               transform: translateY(0);
           }
           
           .close-modal {
               float: right;
               font-size: 1.5rem;
               font-weight: bold;
               cursor: pointer;
           }
           
           .close-modal:hover {
               color: #777;
           }
           
           /* Polyfill pour :contains() */
           :not(:defined):not(:defined) {
               display: none;
           }
       `;
       document.head.appendChild(style);
   
       // Initialiser les filtres et appliquer le filtrage initial
       updatePositionOptions();
       updateDepartmentOptions();
       filterTable();
   });
   document.addEventListener('DOMContentLoaded', function() {
    // Récupération des éléments du formulaire
    const jobPostingForm = document.getElementById('jobPostingForm');
    const skillInput = document.getElementById('skillInput');
    const addSkillBtn = document.getElementById('addSkill');
    const skillsContainer = document.getElementById('skillsContainer');
    const jobDescriptionEditor = document.getElementById('jobDescription');
    const cancelBtn = document.querySelector('.btn-cancel');
    const publishBtn = document.querySelector('.btn-publish');
    
    // Dates: Configurer les dates min et max
    const today = new Date();
    const publishDateInput = document.getElementById('publishDate');
    const applicationDeadlineInput = document.getElementById('applicationDeadline');
    
    // Format de date YYYY-MM-DD pour l'attribut min des inputs date
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    publishDateInput.min = formatDate(today);
    applicationDeadlineInput.min = formatDate(today);
    
    // Par défaut, mettre la date du jour comme date de publication
    publishDateInput.value = formatDate(today);
    
    // S'assurer que la date limite est après la date de publication
    publishDateInput.addEventListener('change', function() {
        const publishDate = new Date(this.value);
        applicationDeadlineInput.min = formatDate(publishDate);
        
        // Si la date limite est avant la nouvelle date de publication, la réinitialiser
        if (new Date(applicationDeadlineInput.value) < publishDate) {
            applicationDeadlineInput.value = formatDate(publishDate);
        }
    });
    
    // Fonctionnalité d'ajout de compétences
    function addSkill() {
        const skillValue = skillInput.value.trim();
        if (!skillValue) return;
        
        // Vérifier si la compétence existe déjà
        const existingSkills = Array.from(skillsContainer.querySelectorAll('.skill-tag'));
        const skillExists = existingSkills.some(skill => skill.textContent.toLowerCase() === skillValue.toLowerCase());
        
        if (skillExists) {
            alert('Cette compétence existe déjà');
            return;
        }
        
        // Créer la balise de compétence
        const skillTag = document.createElement('div');
        skillTag.classList.add('skill-tag');
        
        // Créer le texte et le bouton de suppression
        const skillText = document.createElement('span');
        skillText.textContent = skillValue;
        
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-skill');
        removeBtn.innerHTML = '&times;';
        removeBtn.type = 'button';
        removeBtn.addEventListener('click', function() {
            skillsContainer.removeChild(skillTag);
        });
        
        // Ajouter les éléments à la balise de compétence
        skillTag.appendChild(skillText);
        skillTag.appendChild(removeBtn);
        
        // Ajouter la balise de compétence au conteneur
        skillsContainer.appendChild(skillTag);
        
        // Réinitialiser l'input
        skillInput.value = '';
    }
    
    // Ajouter une compétence en cliquant sur le bouton
    addSkillBtn.addEventListener('click', addSkill);
    
    // Ajouter une compétence en appuyant sur Entrée
    skillInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    // Éditeur de texte riche pour la description détaillée
    const toolbarButtons = document.querySelectorAll('.toolbar button');
    
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const command = getCommandFromButton(this);
            if (command) {
                document.execCommand(command, false, null);
                jobDescriptionEditor.focus();
            }
        });
    });
    
    function getCommandFromButton(button) {
        const icon = button.querySelector('i');
        if (icon.classList.contains('fa-bold')) return 'bold';
        if (icon.classList.contains('fa-italic')) return 'italic';
        if (icon.classList.contains('fa-underline')) return 'underline';
        if (icon.classList.contains('fa-list-ul')) return 'insertUnorderedList';
        if (icon.classList.contains('fa-list-ol')) return 'insertOrderedList';
        if (icon.classList.contains('fa-heading')) {
            // Pour les titres, nous utilisons formatBlock
            const headingLevel = prompt('Choisir un niveau de titre (1-6):', '2');
            if (headingLevel && !isNaN(headingLevel) && headingLevel >= 1 && headingLevel <= 6) {
                document.execCommand('formatBlock', false, `h${headingLevel}`);
            }
            return null;
        }
        if (icon.classList.contains('fa-quote-right')) return 'formatBlock|blockquote';
    }
    
    // Gestionnaire d'événements spécifique pour les commandes complexes
    document.querySelectorAll('.toolbar button').forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('fa-heading')) {
                const headingLevel = prompt('Choisir un niveau de titre (1-6):', '2');
                if (headingLevel && !isNaN(headingLevel) && headingLevel >= 1 && headingLevel <= 6) {
                    document.execCommand('formatBlock', false, `h${headingLevel}`);
                }
            } else if (icon.classList.contains('fa-quote-right')) {
                document.execCommand('formatBlock', false, 'blockquote');
            }
        });
    });
    
    // Validation du formulaire
    jobPostingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Réinitialiser les messages d'erreur
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.style.display = 'none';
        });
        
        let isValid = true;
        
        // Valider les champs requis
        const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                const errorMsg = input.nextElementSibling;
                if (errorMsg && errorMsg.classList.contains('error-message')) {
                    errorMsg.style.display = 'block';
                }
            }
        });
        
        // Valider l'éditeur de texte riche
        if (jobDescriptionEditor.innerHTML.trim() === '') {
            isValid = false;
            const errorMsg = jobDescriptionEditor.parentElement.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-message')) {
                errorMsg.style.display = 'block';
            }
        }
        
        // Valider les dates
        const publishDate = new Date(publishDateInput.value);
        const deadlineDate = new Date(applicationDeadlineInput.value);
        
        if (deadlineDate < publishDate) {
            isValid = false;
            alert('La date limite doit être après la date de publication');
        }
        
        // Valider le salaire
        const salaryMin = parseFloat(document.getElementById('salaryMin').value);
        const salaryMax = parseFloat(document.getElementById('salaryMax').value);
        
        if (salaryMin && salaryMax && salaryMin > salaryMax) {
            isValid = false;
            alert('Le salaire minimum ne peut pas être supérieur au salaire maximum');
        }
        
        // Si tout est valide, soumettre le formulaire
        if (isValid) {
            // Récupérer les compétences
            const skills = Array.from(skillsContainer.querySelectorAll('.skill-tag')).map(tag => 
                tag.querySelector('span').textContent
            );
            
            // Récupérer les catégories sélectionnées
            const categories = Array.from(document.querySelectorAll('input[name="categories"]:checked')).map(input => 
                input.value
            );
            
            // Créer l'objet de données
            const formData = {
                jobTitle: document.getElementById('jobTitle').value,
                department: document.getElementById('department').value,
                location: document.getElementById('location').value,
                employmentType: document.getElementById('employmentType').value,
                experienceLevel: document.getElementById('experienceLevel').value,
                publishDate: publishDateInput.value,
                applicationDeadline: applicationDeadlineInput.value,
                salaryMin: document.getElementById('salaryMin').value || null,
                salaryMax: document.getElementById('salaryMax').value || null,
                showSalary: document.getElementById('showSalary').checked,
                shortDescription: document.getElementById('shortDescription').value,
                jobDescription: jobDescriptionEditor.innerHTML,
                skills: skills,
                categories: categories
            };
            
            // Afficher les données dans la console pour démonstration
            console.log('Données du formulaire:', formData);
            
            // Ici, vous pouvez ajouter le code pour envoyer les données au serveur
            // Exemple avec fetch:
            /*
            fetch('/api/job-postings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Succès:', data);
                alert('Annonce publiée avec succès!');
                window.location.href = '/job-postings'; // Redirection
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Une erreur est survenue lors de la publication de l\'annonce.');
            });
            */
            
            // Pour la démonstration, nous allons simplement afficher un message
            alert('Annonce publiée avec succès! (Simulation)');
        }
    });
    
    // Bouton Annuler
    cancelBtn.addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir annuler? Toutes les données saisies seront perdues.')) {
            window.location.href = '/job-postings'; // Rediriger vers la liste des annonces
            // Ou réinitialiser le formulaire:
            // jobPostingForm.reset();
            // jobDescriptionEditor.innerHTML = '';
            // skillsContainer.innerHTML = '';
        }
    });
});
   


document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Supprimer la classe active de tous les onglets
            tabs.forEach(t => t.classList.remove('active'));
            
            // Ajouter la classe active à l'onglet cliqué
            this.classList.add('active');
            
            // Ici on pourrait ajouter du code pour charger des données spécifiques à l'onglet
        });
    });
});

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function() {
// Sélectionner les éléments du DOM
const typeSelect = document.querySelector('.filter-options select:first-child');
const statusSelect = document.querySelector('.filter-options select:last-child');
const searchInput = document.querySelector('.search-bar input');
const interviewCards = document.querySelectorAll('.interview-card');
const tabs = document.querySelectorAll('.tab');

// Fonction pour filtrer les entretiens
function filterInterviews() {
const typeFilter = typeSelect.value;
const statusFilter = statusSelect.value;
const searchTerm = searchInput.value.toLowerCase();
const activeTab = document.querySelector('.tab.active').textContent;

// Parcourir toutes les cartes d'entretien
interviewCards.forEach(card => {
    // Récupérer les données de la carte
    const cardContent = card.querySelector('.interview-card-content');
    const cardHeader = card.querySelector('.interview-card-header');
    
    const candidateName = cardContent.querySelector('.name').textContent.toLowerCase();
    const candidatePosition = cardContent.querySelector('.position').textContent.toLowerCase();
    const interviewType = cardContent.querySelector('.interview-details .interview-detail:nth-child(1) div:last-child').textContent;
    const interviewStatus = cardHeader.querySelector('.interview-status').textContent;
    
    // Filtrer par terme de recherche
    const matchesSearch = searchTerm === '' || 
                          candidateName.includes(searchTerm) || 
                          candidatePosition.includes(searchTerm);
    
    // Filtrer par type d'entretien
    const matchesType = typeFilter === 'Tous les types' || interviewType === typeFilter;
    
    // Filtrer par statut
    const matchesStatus = statusFilter === 'Tous les statuts' || 
                         (statusFilter === 'Programmé' && (interviewStatus === 'Aujourd\'hui' || interviewStatus === 'Demain' || interviewStatus === 'Vendredi')) ||
                         (statusFilter === 'Complété' && interviewStatus === 'Complété') ||
                         (statusFilter === 'Annulé' && interviewStatus === 'Annulé');
    
    // Filtrer par onglet actif
    let matchesTab = false;
    switch(activeTab) {
        case 'Aujourd\'hui':
            matchesTab = interviewStatus === 'Aujourd\'hui';
            break;
        case 'Cette semaine':
            matchesTab = interviewStatus === 'Aujourd\'hui' || interviewStatus === 'Demain' || interviewStatus === 'Vendredi';
            break;
        case 'À venir':
            matchesTab = interviewStatus === 'Aujourd\'hui' || interviewStatus === 'Demain' || interviewStatus === 'Vendredi';
            break;
        case 'Passés':
            matchesTab = interviewStatus === 'Complété';
            break;
        default:
            matchesTab = true;
    }
    
    // Afficher ou masquer la carte en fonction des filtres
    if (matchesSearch && matchesType && matchesStatus && matchesTab) {
        card.style.display = 'block';
    } else {
        card.style.display = 'none';
    }
});

// Vérifier s'il y a des entretiens visibles
checkNoResults();
}

// Fonction pour vérifier s'il n'y a aucun résultat et afficher un message
function checkNoResults() {
const visibleCards = Array.from(interviewCards).filter(card => card.style.display !== 'none');
const noResultsMessage = document.getElementById('no-results-message');

if (visibleCards.length === 0) {
    // Créer un message si aucun entretien ne correspond aux filtres
    if (!noResultsMessage) {
        const message = document.createElement('div');
        message.id = 'no-results-message';
        message.className = 'no-results';
        message.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
                <h3>Aucun entretien trouvé</h3>
                <p>Modifiez vos critères de recherche pour voir les entretiens.</p>
            </div>
        `;
        document.querySelector('.interview-cards').after(message);
    }
} else if (noResultsMessage) {
    // Supprimer le message s'il y a des entretiens visibles
    noResultsMessage.remove();
}
}

// Ajouter des écouteurs d'événements pour les changements de filtres et recherche
typeSelect.addEventListener('change', filterInterviews);
statusSelect.addEventListener('change', filterInterviews);
searchInput.addEventListener('input', filterInterviews);

// Gestion des onglets
tabs.forEach(tab => {
tab.addEventListener('click', function() {
    // Supprimer la classe active de tous les onglets
    tabs.forEach(t => t.classList.remove('active'));
    
    // Ajouter la classe active à l'onglet cliqué
    this.classList.add('active');
    
    // Appliquer les filtres avec le nouvel onglet actif
    filterInterviews();
});
});

// Fonction pour ajouter des données fictives de statut aux entretiens existants
function addMockStatusData() {
// Ajout des attributs data pour faciliter le filtrage (dans un cas réel, ces données viendraient du backend)
interviewCards.forEach(card => {
    const statusElement = card.querySelector('.interview-status');
    const status = statusElement.textContent;
    
    // Ajouter un attribut data-status pour faciliter le filtrage
    if (status === 'Aujourd\'hui' || status === 'Demain' || status === 'Vendredi') {
        card.setAttribute('data-status', 'Programmé');
    } else {
        card.setAttribute('data-status', status);
    }
    
    // Extraire et ajouter le type d'entretien comme attribut data
    const typeText = card.querySelector('.interview-details .interview-detail:nth-child(1) div:last-child').textContent;
    card.setAttribute('data-type', typeText);
});
}

// Initialiser les attributs de données mock
addMockStatusData();

// Appliquer les filtres au chargement initial
filterInterviews();

// Ajouter un événement pour le bouton d'ajout d'entretien
const addButton = document.querySelector('.btn-add');
if (addButton) {
addButton.addEventListener('click', function() {
    alert('Fonctionnalité d\'ajout d\'entretien à implémenter');
    // Ici, on pourrait ouvrir une modale pour ajouter un nouvel entretien
});
}
});


     // Données pour différentes périodes
     const chartData = {
        week: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [
                {
                    label: 'Ventes',
                    data: [5, 8, 12, 15, 10, 7, 4],
                    borderColor: '#e63312',
                    backgroundColor: 'rgba(230, 51, 18, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'IT',
                    data: [3, 6, 9, 12, 10, 8, 5],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Marketing',
                    data: [4, 7, 9, 8, 11, 6, 3],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        month: {
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
            datasets: [
                {
                    label: 'Ventes',
                    data: [10, 15, 12, 25, 28, 32, 38, 42, 45, 48, 52, 58],
                    borderColor: '#e63312',
                    backgroundColor: 'rgba(230, 51, 18, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'IT',
                    data: [5, 10, 8, 15, 20, 25, 30, 35, 38, 45, 50, 55],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Marketing',
                    data: [8, 12, 15, 18, 22, 25, 28, 30, 33, 35, 38, 40],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        year: {
            labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
            datasets: [
                {
                    label: 'Ventes',
                    data: [120, 180, 210, 250, 320, 380],
                    borderColor: '#e63312',
                    backgroundColor: 'rgba(230, 51, 18, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'IT',
                    data: [90, 140, 170, 220, 280, 350],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Marketing',
                    data: [80, 110, 150, 190, 240, 300],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true
                }
            ]
        }
    };
    
    // Configuration du graphique
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            family: "'Segoe UI', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    titleFont: {
                        family: "'Segoe UI', sans-serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: "'Segoe UI', sans-serif",
                        size: 13
                    },
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 5,
                    usePointStyle: true,
                    callbacks: {
                        labelPointStyle: function(context) {
                            return {
                                pointStyle: 'rectRounded',
                                rotation: 0
                            };
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Segoe UI', sans-serif",
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [3, 3],
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            family: "'Segoe UI', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 6
                }
            }
        }
    };
    
    // Fonction principale pour initialiser les graphiques et gérer les périodes
    document.addEventListener('DOMContentLoaded', function() {
        const ctx = document.getElementById('applicationsChart').getContext('2d');
        let currentPeriod = 'month'; // Période par défaut
        let chartInstance = null;
        
        // Fonction pour créer ou mettre à jour le graphique
        function createOrUpdateChart(period) {
            // Si un graphique existe déjà, le détruire pour éviter des conflits
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            // Cloner les données pour éviter toute modification accidentelle
            const dataForPeriod = JSON.parse(JSON.stringify(chartData[period]));
            
            // Créer une nouvelle configuration complète
            const config = {
                ...chartConfig,
                data: dataForPeriod
            };
            
            // Créer une nouvelle instance du graphique
            chartInstance = new Chart(ctx, config);
            
            console.log('Graphique créé/mis à jour pour la période:', period);
            console.log('Labels:', dataForPeriod.labels);
            console.log('Première série de données:', dataForPeriod.datasets[0].data);
        }
        
        // Créer le graphique initial
        createOrUpdateChart(currentPeriod);
        
        // Ajouter des attributs data aux boutons de période pour une identification plus fiable
        const periodButtons = document.querySelectorAll('.period-option');
        periodButtons.forEach(button => {
            const text = button.textContent.trim().toLowerCase();
            if (text.includes('semaine')) {
                button.setAttribute('data-period', 'week');
            } else if (text.includes('mois')) {
                button.setAttribute('data-period', 'month');
            } else if (text.includes('année') || text.includes('annee')) {
                button.setAttribute('data-period', 'year');
            }
        });
        
        // Récupérer tous les boutons de période
        const periodOptions = document.querySelectorAll('.period-option');
        
        // Ajouter des écouteurs d'événements pour chaque bouton
        periodOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Retirer la classe active de tous les boutons
                periodOptions.forEach(opt => opt.classList.remove('active'));
                
                // Ajouter la classe active au bouton cliqué
                this.classList.add('active');
                
                // Récupérer la période à partir de l'attribut data
                const selectedPeriod = this.getAttribute('data-period');
                
                console.log('Bouton cliqué:', this.textContent.trim());
                console.log('Période sélectionnée depuis data-attribute:', selectedPeriod);
                
                // Si l'attribut data n'est pas disponible, essayer de détecter à partir du texte
                let periodToUse = selectedPeriod;
                if (!periodToUse) {
                    const buttonText = this.textContent.trim().toLowerCase();
                    if (buttonText.includes('semaine')) {
                        periodToUse = 'week';
                    } else if (buttonText.includes('mois')) {
                        periodToUse = 'month';
                    } else if (buttonText.includes('année') || buttonText.includes('annee')) {
                        periodToUse = 'year';
                    }
                    console.log('Période détectée depuis le texte:', periodToUse);
                }
                
                // Vérifier que la période est valide et que les données existent
                if (periodToUse && chartData[periodToUse]) {
                    createOrUpdateChart(periodToUse);
                    currentPeriod = periodToUse;
                } else {
                    console.error('Période non reconnue ou données manquantes:', periodToUse);
                }
            });
        });
    
        // Animation des éléments lorsqu'ils apparaissent dans la vue
        const cards = document.querySelectorAll('.card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        cards.forEach(card => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    });


       // Toggle sidebar on mobile
       document.addEventListener('DOMContentLoaded', function() {
        const menuToggleBtn = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
        }
        
        // Filter functionality
        const filterDropdowns = document.querySelectorAll('.filter-dropdown');
        const searchInput = document.querySelector('.search-container input');
        const jobCards = document.querySelectorAll('.job-card');
        
        // Function to filter jobs
        function filterJobs() {
            const departmentFilter = filterDropdowns[0].value;
            const statusFilter = filterDropdowns[1].value;
            const searchTerm = searchInput.value.toLowerCase();
            
            jobCards.forEach(card => {
                const department = card.querySelector('.job-department').textContent.toLowerCase();
                const statusElement = card.querySelector('.status-badge');
                const status = statusElement ? statusElement.classList[1].replace('status-', '') : '';
                const title = card.querySelector('.job-title').textContent.toLowerCase();
                const description = card.querySelector('.job-description').textContent.toLowerCase();
                
                const matchesDepartment = !departmentFilter || department.includes(departmentFilter.toLowerCase());
                const matchesStatus = !statusFilter || status === statusFilter;
                const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
                
                if (matchesDepartment && matchesStatus && matchesSearch) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // Add event listeners
        if (filterDropdowns.length > 0) {
            filterDropdowns.forEach(dropdown => {
                dropdown.addEventListener('change', filterJobs);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', filterJobs);
        }
        

    });

    document.addEventListener('DOMContentLoaded', function() {
// Sélectionner tous les boutons d'action
const editButtons = document.querySelectorAll('.btn-action[title="Modifier"]');
const lockButtons = document.querySelectorAll('.btn-action[title="Clôturer"]');
const statusButtons = document.querySelectorAll('.btn-action[title="Changer l\'état"]');
const deleteButtons = document.querySelectorAll('.btn-action[title="Supprimer"]');

// Tableau pour stocker les éléments supprimés
const deletedElements = [];
const deletedCloses = [];

// Délai avant que la suppression ne soit définitive (en millisecondes)
const deletionDelay = 10000; // 10 secondes

// Fonction pour créer une notification
function createNotification(message, type = 'info', parent) {
const notification = document.createElement('div');
notification.className = `notification notification-${type}`;
notification.innerHTML = `
<span>${message}</span>
${type === 'warning' ? '<button class="btn-undo">Annuler</button>' : ''}
`;

// Ajouter la notification après l'élément parent
parent.parentNode.insertBefore(notification, parent.nextSibling);

// Ajouter un écouteur d'événement au bouton d'annulation si présent
const undoButton = notification.querySelector('.btn-undo');
if (undoButton) {
undoButton.addEventListener('click', function() {
undoLastDeletion();
undoLastClose();
notification.remove();
});
}

// Supprimer automatiquement la notification après un délai
setTimeout(() => {
notification.classList.add('fade-out');
setTimeout(() => notification.remove(), 500);
}, deletionDelay - 500);

return notification;
}

// Fonction pour changer l'état d'une offre d'emploi
function changeJobStatus(jobCard, button) {
const statusBadge = jobCard.querySelector('.status-badge');
const currentStatus = statusBadge.textContent.toLowerCase();
let newStatus;

// Rotation des états: active -> urgent -> clôturé -> active
switch (currentStatus) {
case 'active':
newStatus = 'urgent';
statusBadge.className = 'status-badge status-urgent';
break;
case 'urgent':
newStatus = 'active';
statusBadge.className = 'status-badge status-active';
break;
default:
newStatus = 'active';
statusBadge.className = 'status-badge status-active';
}

statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

// Afficher une notification
createNotification(`L'état de l'offre a été changé en "${newStatus}"`, 'info', jobCard);
}

function closeJob(jobCard, button) {
// Si l'offre est déjà marquée pour clôture
if (jobCard.classList.contains('job-closed')) {
return;
}

// Stocker les données de l'offre pour une annulation possible
const jobData = {
element: jobCard,
originalStatus: jobCard.querySelector('.status-badge').textContent,
originalClass: jobCard.querySelector('.status-badge').className,
timeoutId: null
};

const statusBadge = jobCard.querySelector('.status-badge');
statusBadge.textContent = 'Clôturé';
statusBadge.className = 'status-badge status-closed';

// Ajouter une classe pour l'effet visuel de l'offre clôturée
jobCard.classList.add('job-closed');

// Créer une notification avec bouton d'annulation (sans message de délai)
const notification = document.createElement('div');
notification.className = 'notification notification-warning';
notification.innerHTML = `
<span>Action de clôture</span>
<button class="btn-undo">Annuler</button>
`;

// Ajouter la notification après l'élément parent
jobCard.parentNode.insertBefore(notification, jobCard.nextSibling);

// Ajouter un écouteur d'événement au bouton d'annulation
const undoButton = notification.querySelector('.btn-undo');
undoButton.addEventListener('click', function() {
undoLastClose();
notification.remove();
});

// Désactiver certains boutons
button.disabled = true;
jobCard.querySelector('.btn-action[title="Changer l\'état"]').disabled = true;

// Définir un délai avant la clôture définitive
jobData.timeoutId = setTimeout(() => {
// Supprimer la notification avec le bouton d'annulation
notification.remove();

// Afficher une notification de confirmation après le délai
createNotification('Cette offre d\'emploi a été clôturée', 'info', jobCard);

// Supprimer l'élément du tableau des clôtures en attente
const index = deletedCloses.findIndex(item => item.element === jobCard);
if (index !== -1) {
deletedCloses.splice(index, 1);
}
}, deletionDelay);

// Ajouter aux éléments clôturés pour permettre l'annulation
deletedCloses.push(jobData);
}

// Fonction pour supprimer une offre d'emploi
function deleteJob(jobCard, button) {
// Si l'offre est déjà marquée pour suppression
if (jobCard.classList.contains('pending-deletion')) {
return;
}

// Stocker les données de l'offre pour une annulation possible
const jobData = {
element: jobCard,
parent: jobCard.parentNode,
nextSibling: jobCard.nextSibling,
timeoutId: null
};

// Ajouter l'effet visuel de suppression en attente
jobCard.classList.add('pending-deletion');

// Créer une notification avec bouton d'annulation
const notification = createNotification(
'Cette offre d\'emploi sera supprimée dans 10 secondes', 
'warning', 
jobCard
);

// Définir un délai avant la suppression définitive
jobData.timeoutId = setTimeout(() => {
jobCard.remove();
notification.remove();

// Supprimer l'élément du tableau des suppressions en attente
const index = deletedElements.findIndex(item => item.element === jobCard);
if (index !== -1) {
deletedElements.splice(index, 1);
}

// Afficher une notification de confirmation
const confirmNotification = document.createElement('div');
confirmNotification.className = 'notification notification-success';
confirmNotification.innerHTML = '<span>L\'offre d\'emploi a été supprimée</span>';
document.body.appendChild(confirmNotification);

setTimeout(() => {
confirmNotification.classList.add('fade-out');
setTimeout(() => confirmNotification.remove(), 500);
}, 3000);

}, deletionDelay);

// Ajouter aux éléments supprimés pour permettre l'annulation
deletedElements.push(jobData);
}

// Fonction pour annuler la dernière suppression
function undoLastDeletion() {
if (deletedElements.length === 0) return;

// Récupérer le dernier élément supprimé
const lastDeleted = deletedElements.pop();

// Annuler le délai de suppression
clearTimeout(lastDeleted.timeoutId);

// Restaurer l'élément à sa position d'origine
lastDeleted.element.classList.remove('pending-deletion');

// Afficher une notification de confirmation
createNotification('La suppression a été annulée', 'success', lastDeleted.element);
}

// Fonction pour annuler la dernière cloture
function undoLastClose() {
if (deletedCloses.length === 0) return;

// Récupérer le dernier élément clôturé
const lastClosed = deletedCloses.pop();

// Annuler le délai de clôture
clearTimeout(lastClosed.timeoutId);

// Restaurer l'élément à son état d'origine
lastClosed.element.classList.remove('job-closed');

// Restaurer le statut et la classe d'origine
const statusBadge = lastClosed.element.querySelector('.status-badge');
statusBadge.textContent = lastClosed.originalStatus;
statusBadge.className = lastClosed.originalClass;

// Réactiver les boutons
lastClosed.element.querySelector('.btn-action[title="Clôturer"]').disabled = false;
lastClosed.element.querySelector('.btn-action[title="Changer l\'état"]').disabled = false;

// Afficher une notification de confirmation
createNotification('La clôture a été annulée', 'success', lastClosed.element);
}

// Fonction pour éditer une offre d'emploi
function editJob(jobCard) {
// Simulation: Redirection vers la page d'édition
// Dans un cas réel, cela pourrait être une redirection ou l'ouverture d'un modal
alert('Redirection vers la page d\'édition de l\'offre');

// Exemple de redirection (à décommenter si nécessaire):
// const jobId = jobCard.dataset.jobId; // Assurez-vous d'avoir un attribut data-job-id sur votre carte
// window.location.href = `/edit-job/${jobId}`;
}

// Ajouter les écouteurs d'événements aux boutons
editButtons.forEach(button => {
button.addEventListener('click', function() {
const jobCard = this.closest('.job-card');
editJob(jobCard);
});
});

lockButtons.forEach(button => {
button.addEventListener('click', function() {
const jobCard = this.closest('.job-card');
closeJob(jobCard, this);
});
});

statusButtons.forEach(button => {
button.addEventListener('click', function() {
const jobCard = this.closest('.job-card');
changeJobStatus(jobCard, this);
});
});

deleteButtons.forEach(button => {
button.addEventListener('click', function() {
const jobCard = this.closest('.job-card');
deleteJob(jobCard, this);
});
});

// Ajouter du CSS dynamique pour les notifications et les animations
const style = document.createElement('style');
style.textContent = `
.notification {
padding: 10px 15px;
margin: 10px 0;
border-radius: 4px;
display: flex;
justify-content: space-between;
align-items: center;
animation: slideIn 0.3s ease-out;
}

.notification-info {
background-color: #e3f2fd;
border-left: 4px solid #2196f3;
color: #0d47a1;
}

.notification-warning {
background-color: #fff8e1;
border-left: 4px solid #ffc107;
color: #ff6f00;
}

.notification-success {
background-color: #e8f5e9;
border-left: 4px solid #4caf50;
color: #1b5e20;
}

.btn-undo {
background-color: transparent;
border: 1px solid currentColor;
border-radius: 3px;
padding: 3px 8px;
cursor: pointer;
font-size: 0.8em;
transition: all 0.2s;
}

.btn-undo:hover {
background-color: rgba(0, 0, 0, 0.1);
}

.pending-deletion {
opacity: 0.5;
position: relative;
}

.pending-deletion::after {
content: "";
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-color: rgba(255, 0, 0, 0.1);
z-index: 1;
}

.job-closed {
opacity: 0.7;
background-color: #f5f5f5;
}

.fade-out {
animation: fadeOut 0.5s forwards;
}

@keyframes slideIn {
from { transform: translateY(-20px); opacity: 0; }
to { transform: translateY(0); opacity: 1; }
}

@keyframes fadeOut {
from { opacity: 1; }
to { opacity: 0; }
}
`;
document.head.appendChild(style);
});
