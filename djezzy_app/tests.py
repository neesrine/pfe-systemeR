from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Admin, Offre, Candidat, Candidature
from django.contrib.auth import authenticate

class OffreTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Créer un admin et un candidat
        self.admin = Admin.objects.create(
            nom_admin='AdminTest',
            email_admin='admin@test.com',
            password='adminpass',
            role='admin'
        )
        self.admin.set_password('adminpass')
        self.admin.save()  # N'oublie pas de sauvegarder l'admin après avoir défini son mot de passe

        self.offre_data = {
            'titre': 'Développeur Python',
            'description': 'Travail sur une API Django',
            'exigences': 'Connaissance en Python',
            'admin': self.admin.id
        }

        self.candidat = Candidat.objects.create(
            nom='Doe', prenom='John', sexe='Homme',
            email='john@example.com', password='1234',
            date_naissance='1990-01-01', telephone='0600000000',
            profession='Développeur', description='Très motivé'
        )

        # Authentifier l'admin pour les tests
        self.client.login(email='admin@test.com', password='adminpass')

    def test_creer_offre(self):
        response = self.client.post('/api/offres/', self.offre_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_modifier_offre(self):
        offre = Offre.objects.create(
            titre='Test Offre', description='desc', exigences='none', admin=self.admin
        )
        response = self.client.patch(f'/api/offres/{offre.id_offre}/', {'titre': 'Offre modifiée'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['titre'], 'Offre modifiée')

    def test_supprimer_offre(self):
        offre = Offre.objects.create(
            titre='Offre à supprimer', description='...', exigences='...', admin=self.admin
        )
        response = self.client.delete(f'/api/offres/{offre.id_offre}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_liste_candidats_postules(self):
        offre = Offre.objects.create(
            titre='Offre Test', description='...', exigences='...', admin=self.admin
        )
        candidature = Candidature.objects.create(
            candidat=self.candidat, offre=offre, admin=self.admin
        )
        response = self.client.get(f'/api/offres/{offre.id_offre}/candidats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_changer_statut_candidature(self):
        offre = Offre.objects.create(
            titre='Offre Test', description='...', exigences='...', admin=self.admin
        )
        candidature = Candidature.objects.create(
            candidat=self.candidat, offre=offre, admin=self.admin
        )
        response = self.client.patch(f'/api/candidatures/{candidature.id}/changer_statut/', {'statut': 'accepte'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        candidature.refresh_from_db()
        self.assertEqual(candidature.statut, 'accepte')
