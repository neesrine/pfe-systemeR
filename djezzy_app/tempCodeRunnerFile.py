from django.db import models

from django.contrib.auth.hashers import make_password, check_password

# Modèle Admin
class Admin(models.Model):
    nom_admin = models.CharField(max_length=100)
    email_admin = models.EmailField()
    password = models.CharField(max_length=100)
    region = models.ForeignKey('Region', on_delete=models.SET_NULL, null=True, blank=True)
    

    class Meta: