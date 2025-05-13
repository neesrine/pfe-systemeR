from rest_framework import viewsets, status
from django.contrib.auth.models import User
from django.utils import timezone
from .serializers import OffreSerializer, CandidatureSerializer
from .permissions import IsAdmin 
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth import login
from django.contrib.auth import logout
from rest_framework.exceptions import ValidationError
from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import permissions
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import (
    Candidat, Langue, Domaine, Specialite, Competence,
    Formation, Experience, Offre, Candidature, Region
)
from .serializers import (
    CandidatSerializer, CandidatDetailSerializer,
    LangueSerializer,
    DomaineSerializer,
    SpecialiteSerializer,
    CompetenceSerializer,
    FormationSerializer,
    ExperienceSerializer,
    OffreSerializer,
    CandidatureSerializer,
    RegionSerializer,
    RegisterCandidatSerializer,  # Assurez-vous que ce serializer existe
    UpdateCandidatProfileSerializer  # Créez ce serializer dans serializers.py
)
# Pages normales (templates HTML)
def home(request):
    return render(request, 'djezzy_app/home.html')

def a_propos(request):
    return render(request, 'djezzy_app/A_propos.html')

def admin_profile(request):
    return render(request, 'djezzy_app/adminProfile.html')

def candidat_profile(request):
    return render(request, 'djezzy_app/candidatProfile.html')

def candidats(request):
    return render(request, 'djezzy_app/candidats.html')

def connexion(request):
    return render(request, 'djezzy_app/connexion.html')

def contact(request):
    return render(request, 'djezzy_app/contact.html')

def creer_annonce(request):
    return render(request, 'djezzy_app/creerAnnonce.html')

def entretien(request):
    return render(request, 'djezzy_app/Entretient.html')

def liste_des_offres(request):
    return render(request, 'djezzy_app/ListeDesOffres.html')

def mes_candidats(request):
    return render(request, 'djezzy_app/mesCandidat.html')

def offres_emploi(request):
    return render(request, 'djezzy_app/offres_d\'emploi.html')

def offres_candidat(request):
    return render(request, 'djezzy_app/offresCandidat.html')

def responsable(request):
    return render(request, 'djezzy_app/Responsable.html')

def tableau_de_bord(request):
    return render(request, 'djezzy_app/tableauDeBord.html')


    
    return render(request, 'djezzy_app/base.html',{})



class IsAdmin(permissions.BasePermission):
    """
    Permission personnalisée qui vérifie si l'utilisateur est un administrateur (role=admin).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'admin'


class IsCandidat(permissions.BasePermission):
    """
    Permission personnalisée qui vérifie si l'utilisateur est un candidat (role=candidat).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'role') and request.user.role == 'candidat'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission qui permet seulement au propriétaire de l'objet de le modifier.
    """
    def has_object_permission(self, request, view, obj):
        # Les permissions en lecture sont autorisées pour toute requête
        if request.method in permissions.SAFE_METHODS:
            return True

        # L'écriture est autorisée uniquement au propriétaire
        if hasattr(obj, 'candidat'):
            return obj.candidat.user == request.user
        return False


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"message": "Déconnexion réussie"})


# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterCandidatSerializer


class RegisterCandidatView(APIView):
    """
    Vue permettant l'inscription d'un nouveau candidat.
    Cette vue crée à la fois un utilisateur Django et un profil Candidat.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterCandidatSerializer(data=request.data)
        if serializer.is_valid():
            candidat = serializer.save()
            return Response({
                "message": "Compte candidat créé avec succès",
                "candidat_id": candidat.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def envoyer_email(sujet, message, destinataire):
    """
    Envoie un e-mail à un destinataire.
    """
    send_mail(
        sujet,
        message,
        settings.EMAIL_HOST_USER,
        [destinataire],
        fail_silently=False,
    )

class CandidatViewSet(viewsets.ModelViewSet):
    """
    Permet aux candidats de gérer leur propre profil et d'accéder à leurs informations.
    """
    queryset = Candidat.objects.all()
    serializer_class = CandidatSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtre pour retourner uniquement le candidat connecté ou tous les candidats pour les admins"""
        if self.request.user.is_staff:
            return Candidat.objects.all()
        elif hasattr(self.request.user, 'candidat'):
            return Candidat.objects.filter(id=self.request.user.candidat.id)
        return Candidat.objects.none()
    
    def get_serializer_class(self):
        """Utilise le serializer détaillé pour le profil complet ou pour la mise à jour"""
        if self.action in ['retrieve']:
            return CandidatDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return UpdateCandidatProfileSerializer
        return super().get_serializer_class()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """
        Récupère le profil du candidat connecté.
        """
        try:
            candidat = request.user.candidat
            serializer = CandidatDetailSerializer(candidat)
            return Response(serializer.data)
        except Candidat.DoesNotExist:
            return Response({"detail": "Profil de candidat non trouvé."}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """
        Permet au candidat de mettre à jour son profil.
        """
        try:
            candidat = request.user.candidat
            serializer = UpdateCandidatProfileSerializer(candidat, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Profil mis à jour avec succès",
                    "candidat": CandidatDetailSerializer(candidat).data
                })
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Candidat.DoesNotExist:
            return Response({"detail": "Profil de candidat non trouvé."}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def postuler_offre(self, request):
        """
        Permet à un candidat de postuler à une offre d'emploi.
        """
        try:
            # Vérifier si l'utilisateur est un candidat
            candidat = request.user.candidat
        except AttributeError:
            return Response({"detail": "Aucun profil candidat trouvé pour cet utilisateur."}, status=status.HTTP_403_FORBIDDEN)

        # Récupération de l'ID de l'offre depuis la requête
        offre_id = request.data.get('offre')

        # Vérifier si l'offre existe
        try:
            offre = Offre.objects.get(id_offre=offre_id)
        except Offre.DoesNotExist:
            return Response({"detail": "Offre introuvable"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier si le candidat a déjà postulé à cette offre
        if Candidature.objects.filter(candidat=candidat, offre=offre).exists():
            return Response({"detail": "Vous avez déjà postulé à cette offre."}, status=status.HTTP_400_BAD_REQUEST)

        # Création de la candidature
        candidature = Candidature.objects.create(
            candidat=candidat,
            offre=offre,
            date_postulation=timezone.now()
        )
        
        # Envoi d'un e-mail de confirmation au candidat
        sujet = "Confirmation de votre candidature"
        message = f"Bonjour {candidat.nom},\n\nVous avez postulé à l'offre '{offre.titre}'. Nous vous tiendrons informé de la suite du processus."
        envoyer_email(sujet, message, candidat.email)
        
        return Response({
            "detail": "Candidature réussie",
            "candidature_id": candidature.id
        }, status=status.HTTP_201_CREATED)


class OffreViewSet(viewsets.ModelViewSet):
    """
    Permet à l'administrateur de gérer les offres d'emploi de sa région uniquement.
    Les candidats peuvent voir toutes les offres mais ne peuvent pas les modifier.
    """
    queryset = Offre.objects.all()
    serializer_class = OffreSerializer
    permission_classes = [AllowAny]  # Autorisation de base: lecture pour tous

    def get_permissions(self):
        """
        Retourne les offres de l'administrateur uniquement pour sa propre région.
        Si l'utilisateur est un administrateur, il peut gérer les offres de toutes les régions.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        """
        Retourne les offres de l'administrateur uniquement pour sa propre région.
        Si l'utilisateur est un administrateur, il peut gérer les offres de toutes les régions.
        """
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Offre.objects.all()
        elif self.request.user.is_authenticated and hasattr(self.request.user, 'admin'):
            admin = self.request.user.admin  # accès à l'objet Admin lié
            return Offre.objects.filter(admin=admin, region=admin.region)
        return Offre.objects.all()  # Les candidats peuvent voir toutes les offres 

    @action(detail=True, methods=['get'], permission_classes=[IsAdmin])
    def candidats(self, request, pk=None):
        """
        Permet à l'administrateur de voir les candidats ayant postulé à une offre spécifique.
        """
        offre = self.get_object()
        candidatures = Candidature.objects.filter(offre=offre)
        serializer = CandidatureSerializer(candidatures, many=True)
        return Response(serializer.data)


class DomaineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à tout le monde de consulter les domaines, mais pas de les modifier.
    """
    queryset = Domaine.objects.all()
    serializer_class = DomaineSerializer
    permission_classes = [AllowAny]


class SpecialiteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à tout le monde de consulter les spécialités, mais pas de les modifier.
    """
    queryset = Specialite.objects.all()
    serializer_class = SpecialiteSerializer
    permission_classes = [AllowAny]


class LangueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à tout le monde de consulter les langues, mais pas de les modifier.
    """
    queryset = Langue.objects.all()
    serializer_class = LangueSerializer
    permission_classes = [AllowAny]


class CompetenceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à tout le monde de consulter les compétences, mais pas de les modifier.
    """
    queryset = Competence.objects.all()
    serializer_class = CompetenceSerializer
    permission_classes = [AllowAny]


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Permet à tout le monde de consulter les régions, mais pas de les modifier.
    """
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    Permet au candidat de gérer ses expériences professionnelles.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        Retourne uniquement les expériences du candidat connecté ou toutes les expériences pour les administrateurs.
        """
        if self.request.user.is_staff:
            return Experience.objects.all()  # L'administrateur peut voir toutes les expériences
        else:
            # Retourner uniquement les expériences du candidat connecté
            try:
                return Experience.objects.filter(candidat=self.request.user.candidat)
            except AttributeError:
                return Experience.objects.none()

    def perform_create(self, serializer):
        """
        Crée une expérience associée au candidat connecté.
        """
        if not hasattr(self.request.user, 'candidat'):
            raise ValidationError("Ce compte n'est pas un candidat.")
        serializer.save(candidat=self.request.user.candidat)


class FormationViewSet(viewsets.ModelViewSet):
    """
    Permet au candidat de gérer ses formations.
    """
    queryset = Formation.objects.all()
    serializer_class = FormationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        """
        Retourne uniquement les formations du candidat connecté ou toutes les formations pour les administrateurs.
        """
        if self.request.user.is_staff:
            return Formation.objects.all()
        else:
            try:
                return Formation.objects.filter(candidat=self.request.user.candidat)
            except AttributeError:
                return Formation.objects.none()

    def perform_create(self, serializer):
        """
        Crée une formation associée au candidat connecté.
        """
        if not hasattr(self.request.user, 'candidat'):
            raise ValidationError("Ce compte n'est pas un candidat.")
        serializer.save(candidat=self.request.user.candidat)


class CandidatureViewSet(viewsets.ModelViewSet):
    """
    Vue pour gérer les candidatures.
    """
    queryset = Candidature.objects.all()
    serializer_class = CandidatureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filtre les candidatures:
        - Admins: candidatures de leur région
        - Candidats: leurs propres candidatures
        """
        if hasattr(self.request.user, 'admin'):
            admin = self.request.user.admin
            return Candidature.objects.filter(offre__region=admin.region)
        elif hasattr(self.request.user, 'candidat'):
            return Candidature.objects.filter(candidat=self.request.user.candidat)
        return Candidature.objects.none()

    def perform_create(self, serializer):
        """
        Lorsqu'un candidat postule, cette méthode s'assure que la candidature
        est bien associée au candidat connecté.
        """
        if not hasattr(self.request.user, 'candidat'):
            raise ValidationError("Seuls les candidats peuvent postuler à une offre.")
        
        candidat = self.request.user.candidat
        offre = serializer.validated_data['offre']
        
        # Vérifier si le candidat a déjà postulé à cette offre
        if Candidature.objects.filter(candidat=candidat, offre=offre).exists():
            raise ValidationError("Vous avez déjà postulé à cette offre.")
        
        serializer.save(candidat=candidat, date_postulation=timezone.now())

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def changer_statut(self, request, pk=None):
        """
        Permet à l'administrateur de changer le statut d'une candidature.
        """
        candidature = self.get_object()
        statut = request.data.get('statut')

        if statut not in ['en_attente', 'accepte', 'refuse']:
            return Response({'detail': 'Statut invalide'}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifie que la candidature fait partie de la région de l'admin
        if hasattr(request.user, 'admin') and candidature.offre.region != request.user.admin.region:
            return Response({'detail': 'Accès interdit aux candidatures d\'autres régions.'}, status=status.HTTP_403_FORBIDDEN)

        candidature.statut = statut
        candidature.save()
        return Response({'detail': 'Statut mis à jour'}, status=status.HTTP_200_OK)
        
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def traiter_candidature(self, request, pk=None):
        """
        Permet à l'administrateur de traiter une candidature (accepter ou refuser).
        """
        candidature = self.get_object()
        action = request.data.get('action')  # "accepter" ou "refuser"

        if action == 'accepter':
            # Logique pour accepter la candidature
            candidature.status = 'acceptée'
            candidature.save()
            
            # Envoyer un e-mail d'acceptation
            sujet = "Votre candidature a été acceptée"
            message = f"Bonjour {candidature.candidat.nom},\n\nVotre candidature a été acceptée. Veuillez vous présenter pour un entretien le {candidature.date_entretien}."
            envoyer_email(sujet, message, candidature.candidat.email)

            return Response({"detail": "Candidature acceptée et e-mail envoyé."}, status=status.HTTP_200_OK)

        elif action == 'refuser':
            # Logique pour refuser la candidature
            candidature.status = 'refusée'
            candidature.save()
        
            # Envoyer un e-mail de refus
            sujet = "Votre candidature a été refusée"
            message = f"Bonjour {candidature.candidat.nom},\n\nNous sommes désolés de vous informer que votre candidature a été refusée."
            envoyer_email(sujet, message, candidature.candidat.email)

            return Response({"detail": "Candidature refusée et e-mail envoyé."}, status=status.HTTP_200_OK)

        else:
            return Response({"detail": "Action invalide."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    """
    Vue de connexion pour les utilisateurs (candidats et admins).
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Essaie d'authentifier avec l'email comme username
    user = authenticate(request, username=email, password=password)

    if user is not None:
        login(request, user)  # Enregistre la session
        
        # Détermine le type d'utilisateur
        user_type = None
        if hasattr(user, 'candidat'):
            user_type = 'candidat'
        elif hasattr(user, 'admin'):
            user_type = 'admin'
        
        return Response({
            'message': 'Connecté avec succès',
            'user_id': user.id,
            'user_type': user_type
        })
    else:
        return Response({'error': 'Identifiants invalides'}, status=400)


from .models import Entretien, Departement
from .serializers import EntretienSerializer, DepartementSerializer

class EntretienViewSet(viewsets.ModelViewSet):
    queryset = Entretien.objects.all()
    serializer_class = EntretienSerializer

class DepartementViewSet(viewsets.ModelViewSet):
    queryset = Departement.objects.all()
    serializer_class = DepartementSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_offres_api(request):
    """
    Récupère la liste des offres d'emploi disponibles.
    Peut être filtrée par région si spécifié.
    """
    region_id = request.query_params.get('region')
    
    # Filtrer par région si spécifié
    if region_id:
        try:
            offres = Offre.objects.filter(region_id=region_id)
        except ValueError:
            return Response({"detail": "ID de région invalide"}, status=status.HTTP_400_BAD_REQUEST)
    else:
        offres = Offre.objects.all()
    
    # Si l'utilisateur est un candidat, vérifier s'il a déjà postulé
    candidatures_ids = []
    if hasattr(request.user, 'candidat'):
        candidatures = Candidature.objects.filter(candidat=request.user.candidat)
        candidatures_ids = [c.offre.id_offre for c in candidatures]
    
    serializer = OffreSerializer(offres, many=True)
    
    # Ajouter l'information sur les candidatures aux données
    data = serializer.data
    for offre in data:
        offre['a_postule'] = offre['id_offre'] in candidatures_ids
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def detail_candidature(request, id):
    """
    Récupère les détails d'une candidature spécifique.
    """
    try:
        # Vérifier si la candidature appartient au candidat connecté
        candidature = Candidature.objects.get(id=id, candidat=request.user.candidat)
        serializer = CandidatureSerializer(candidature)
        return Response(serializer.data)
    except Candidature.DoesNotExist:
        return Response({"detail": "Candidature non trouvée ou accès non autorisé."}, 
                       status=status.HTTP_404_NOT_FOUND)
    

from .models import CandidatLangue
from .serializers import CandidatLangueSerializer

class CandidatLangueViewSet(viewsets.ModelViewSet):
    queryset = CandidatLangue.objects.all()
    serializer_class = CandidatLangueSerializer    