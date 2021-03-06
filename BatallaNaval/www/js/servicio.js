angular.module('starter.servicio', [])
.service('Servicio', function() {
    this.Nombre = "Servicio Desafio";
    this.Guardar = Guardar;
    this.Buscar = Buscar;
    this.Editar = Editar;
    this.Cargar = Cargar;

    function Guardar(ruta, objeto){
      return firebase.database().ref(ruta).set(objeto);
    }

    function Editar(objeto){
      return firebase.database().ref().update(objeto);
    }

    function Buscar(ruta){
      var datos = [];
      firebase.database().ref(ruta).on('child_added', function (snapshot) 
      {
        datos.push(snapshot.val());
      });

      return datos;
    }

    function Cargar(ruta){
      return firebase.database().ref(ruta);
    }

  })//Cierra Servicio
