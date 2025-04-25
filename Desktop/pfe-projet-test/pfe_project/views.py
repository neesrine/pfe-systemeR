# pfe_project/views.py

from django.shortcuts import render

def home(request):
    return render(request,'djezzy_app/home.html')
