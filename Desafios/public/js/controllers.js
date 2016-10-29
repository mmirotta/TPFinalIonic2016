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
      var desafio = snapshot.val();
      desafio.pagina = "salaDesafios";
      if (desafio.aceptada == false && desafio.finalizada == false) 
        $scope.desafios.push(desafio);
    });
  });

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  }

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
  }
})

.controller('MisDesafiosCtrl', function($scope, $state, $timeout) {
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
      var desafio = snapshot.val();
      desafio.pagina = "misDesafios";
      if (desafio.usuarioCreador.nombre == $scope.usuario.nombre || desafio.usuarioAcepta.nombre == $scope.usuario.nombre)
        $scope.desafios.push(desafio);
    });
  });

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  }

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
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
  $scope.desafio.apuesta = 10;
  $scope.desafio.vencimiento = 1;

  $scope.Guardar = function(){
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      firebase.database().ref('desafio/' + $scope.desafio.titulo).set({
        titulo: $scope.desafio.titulo,
        descripcion: $scope.desafio.descripcion,
        apuesta: $scope.desafio.apuesta,
        vencimiento: $scope.desafio.vencimiento,
        aceptada: false,
        finalizada: false,
        usuarioCreador: {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo},
        usuarioAcepta: {nombre:false, correo:false},
        fechaCreacion: fecha
      });

      console.log($scope.usuarioReserva.monto);

      firebase.database().ref('reserva/' + $scope.usuario.nombre + '/' + $scope.desafio.titulo).set({
        usuario: $scope.usuario.nombre, monto: parseInt($scope.desafio.apuesta), vencido: false
      });

      $state.go('app.salaDesafios');
  }
  
})

.controller('DesafioVerCtrl', function($scope, $stateParams, $timeout, $state) {
  var usuarioLogeado = firebase.auth().currentUser;
  $scope.usuario = {};
  $scope.mensaje = {};
  $scope.mensaje.ver = false;
  var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
  referenciaUsuario.on('value', function(snapshot) {
    $timeout(function() {
      $scope.usuario = snapshot.val();
    });
  });

  $scope.desafio = {};
  $scope.desafio = JSON.parse($stateParams.desafio);
  $scope.Aceptar = function(){
      var updates = {};
      updates['/desafio/' + $scope.desafio.titulo + '/aceptada'] = true;
      updates['/desafio/' + $scope.desafio.titulo + '/usuarioAcepta'] = {nombre:$scope.usuario.nombre, correo:$scope.usuario.correo};
      updates['/desafio/' + $scope.desafio.titulo + '/fechaAceptada'] = firebase.database.ServerValue.TIMESTAMP;
      
      firebase.database().ref().update(updates);

      firebase.database().ref('reserva/' + $scope.usuario.nombre + '/' + $scope.desafio.titulo).set({
        usuario: $scope.usuario.nombre, monto: parseInt($scope.desafio.apuesta), vencido: false
      });

      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has aceptado la apuesta, suerte.";
  }

  $scope.Volver = function(){
    console.info($scope.desafio);
    if ($scope.desafio.pagina == "salaDesafios")
      $state.go('app.salaDesafios');
    else if ($scope.desafio.pagina == "misDesafios")
      $state.go('app.misDesafios');
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
      updates['/usuario/' + usuario.displayName + '/fechaAcceso'] = firebase.database.ServerValue.TIMESTAMP;

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

.controller('RegistroCtrl', function($scope, $stateParams, $timeout, $state) {
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
        fechaAcceso: fecha,
        perfil:"cliente"
      });
      firebase.auth().signInWithEmailAndPassword($scope.login.usuario, $scope.login.clave).catch(function (error){

      }).then( function(resultado){
        firebase.auth().currentUser.updateProfile({
          displayName: $scope.login.nombre,
        }).then(function() {  
          $state.go('app.perfil');
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
