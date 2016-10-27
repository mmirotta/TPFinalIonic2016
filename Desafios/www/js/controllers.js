angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $timeout) {
  $scope.usuario = firebase.auth().currentUser;
})

.controller('SalaDesafiosCtrl', function($scope, $state, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafios = [];

  var referenciaDesafios = firebase.database().ref('desafio/');
  referenciaDesafios.on('child_added', function (snapshot) {
    $timeout(function() {
      $scope.desafios.push(snapshot.val());
    });
  });

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  }
})

.controller('PerfilCtrl', function($scope, $stateParams, $timeout) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referencia = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referencia.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
      $scope.usuarioReserva = {};
      var referenciaReserva = firebase.database().ref('reserva/' + $scope.usuario.nombre);
      referenciaReserva.on('value', function(snapshot) {
        $timeout(function() {
          if (snapshot.val() != null)
            {
              $scope.usuarioReserva = snapshot.val();
              $scope.usuario.saldo = parseInt($scope.usuario.saldo) - parseInt($scope.usuarioReserva.monto);
            }
        });
      });
    });
  });
})

.controller('DesafioCtrl', function($scope, $stateParams, $timeout, $state) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.usuarioReserva = {};
  $scope.usuarioReserva.nombre = usuarioLogeado.displayName;
  $scope.usuarioReserva.monto = 0;
  var referenciaReserva = firebase.database().ref('reserva/' + usuarioLogeado.displayName);
  referenciaReserva.on('value', function(snapshot) {
    $timeout(function() {
      if (snapshot.val() != null)
        $scope.usuarioReserva = snapshot.val();
    });
  });

  $scope.desafio = {};

  $scope.Guardar = function(){
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      firebase.database().ref('desafio/' + $scope.desafio.titulo).set({
        titulo: $scope.desafio.titulo,
        descripcion: $scope.desafio.descripcion,
        apuesta: $scope.desafio.apuesta,
        vencimiento: $scope.desafio.vencimiento,
        aceptada: false,
        finalizada: false,
        usuarioCreador: $scope.usuario.nombre,
        fechaCreacion: fecha
      });

      console.log($scope.usuarioReserva.monto);

      firebase.database().ref('reserva/' + $scope.usuario.nombre).set({
        usuario: $scope.usuario.nombre,
        monto: parseInt($scope.usuarioReserva.monto) + parseInt($scope.desafio.apuesta)
      });

      $state.go('app.salaDesafios');
  }
  
})

.controller('DesafioVerCtrl', function($scope, $stateParams, $timeout, $state) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafio = {};

  var referenciaDesafios = firebase.database().ref('desafio/' + $stateParams.titulo);
  referenciaDesafios.on('value', function(snapshot) {
    $timeout(function() {
      $scope.desafio = snapshot.val();
    });
  });

  $scope.Aceptar = function(){
      var updates = {};
      updates['/desafio/' + $stateParams.titulo + '/aceptada'] = true;
      updates['/desafio/' + $stateParams.titulo + '/usuarioAcepta'] = $scope.usuario.nombre;

      firebase.database().ref().update(updates);
  }

  $scope.Volver = function(){
    $state.go('app.salaDesafios');
  }
  
})

.controller('LoginCtrl', function($scope, $stateParams, $timeout, $state) {
  $scope.logueado = 'no';
  $scope.verificado = 'no';

  $scope.login = {};
  $scope.login.usuario = "m.mirotta@gmail.com";
  $scope.login.clave = "123456";

  $scope.Logear = function (){
    firebase.auth().signInWithEmailAndPassword($scope.login.usuario, $scope.login.clave).catch(function (error){

      console.info("Error", error);
    }).then( function(resultado){

      var usuario = firebase.auth().currentUser;

      var updates = {};
      updates['/usuario/' + usuario.displayName + '/fechaAcceso'] = firebase.database.ServerValue.TIMESTAMP;;

      firebase.database().ref().update(updates);

      $timeout(function() {
        $scope.logueado = 'si';
        if (resultado.emailVerified == false)
        {
          $scope.verificado = 'no';
        }
        else
        {
          $scope.verificado = 'si';
          $state.go('app.perfil');
        }


      });
      console.info("login correcto", resultado);

    });
  };

  $scope.Deslogear = function (){
    firebase.auth().signOut().catch(function (error){
      console.info("login incorrecto", error);
    }).then( function(resultado){
      $timeout(function() {
        $scope.logueado = 'no';
        $scope.usuario = JSON.stringify(resultado);
        //$scope.usuario = JSON.stringify(firebase.auth().currentUser()); Esto es para usarlo en cualquier lado porque firebase esta global
      });
      console.info("deslogueo correcto", resultado);
    });
  };

  $scope.Resetear = function (){
    firebase.auth().sendPasswordResetEmail($scope.login.usuario).then(function(resultado){
      console.info("resertear clave correcto", resultado);
    }).catch(function (error){
      console.info("resertear clave incorrecto", error);
    });
  };

  $scope.VerificarMail = function (){
    firebase.auth().currentUser.sendEmailVerification().then(function(resultado){
      console.info("verifico el usuario correcto", resultado);
    }).catch(function (error){
      console.info("verifico el usuario incorrecto", error);
    });
  };

  $scope.LoginGitHub = function (){
    var provider = new firebase.auth.GithubAuthProvider();
    provider.addScope('repo');

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;

      console.info(user);

    }).catch(function(error) {
      
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      console.info(errorMessage);
      // ...
    });
  };

})

.controller('RegistroCtrl', function($scope, $stateParams, $timeout) {
  $scope.login = {};
  $scope.login.usuario = "jperez@gmail.com";
  $scope.login.clave = "123456";
  $scope.login.nombre = "Juan Perez";

  $scope.Registrar = function (){
    firebase.auth().createUserWithEmailAndPassword($scope.login.usuario, $scope.login.clave).then(function(resultado){
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      firebase.database().ref('usuario/' + $scope.login.nombre).set({
        correo: $scope.login.usuario,
        nombre: $scope.login.nombre,
        saldo: "1000",
        fechaCreacion: fecha,
        fechaAcceso: fecha
      });
      firebase.auth().signInWithEmailAndPassword($scope.login.usuario, $scope.login.clave).catch(function (error){

      }).then( function(resultado){
        firebase.auth().currentUser.updateProfile({
          displayName: $scope.login.nombre,
        }).then(function() {

        }, function(error) {
          // An error happened.
        });
      });

    },function (error){
      if(error.code == "auth/email-already-in-use")
        $scope.errorMensaje = "El email ya esta registrado";

      console.info("registrar el usuario incorrecto", error);
    });
  };
});
