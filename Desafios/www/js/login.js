angular.module('starter.login', [])

.controller('LoginCtrl', function($scope, $stateParams, $timeout, $state, Servicio) {
  $scope.logueado = 'no';
  $scope.verificado = 'no';

  $scope.login = {};
  $scope.login.usuario = "m.mirotta@gmail.com";
  $scope.login.clave = "123456";

  $scope.mensajeLogin = {};
  $scope.mensajeLogin.ver = false;

  $scope.Logear = function (){
    $scope.errorLogin = {};
    $scope.errorLogin.ver = false;
    firebase.auth().signInWithEmailAndPassword($scope.login.usuario, $scope.login.clave)
    .then( function(resultado){
      var usuario = firebase.auth().currentUser;
      var updates = {};
      updates['/usuario/' + usuario.displayName + '/fechaAcceso'] = firebase.database.ServerValue.TIMESTAMP;
      Servicio.Editar(updates);

      $timeout(function() {
        $scope.logueado = 'si';
        if (usuario.emailVerified == false)
        {
          $scope.verificado = 'no';
        }
        else
        {
          $scope.verificado = 'si';
          $state.go('app.perfil');
        }
      });
    }, function (error){
        $timeout(function() {
          switch (error.code)
          {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-email":
                $scope.errorLogin.mensaje = "Correo o contraseña incorrectos.";
                $scope.errorLogin.ver = true;
              break;

          }
          console.info(error.code);
        });
    });
  };

  $scope.Deslogear = function (){
    try
    {
      $scope.errorLogin = {};
      $scope.errorLogin.ver = false;
      firebase.auth().signOut().catch(function (error){
          $scope.mensajeLogin.ver = true;
          $scope.mensajeLogin.mensaje = "No se pudo salir de la aplicación, intente nuevamente.";
          $scope.mensajeLogin.estilo = "alert-danger";
      }).then( function(resultado){
        $timeout(function() {
          $scope.logueado = 'no';
          $scope.mensajeLogin.ver = true;
          $scope.mensajeLogin.mensaje = "Gracias por utilizar la aplicación.";
          $scope.mensajeLogin.estilo = "alert-success";
        });
      });
    }
    catch (error)
    {
      $scope.mensajeLogin.mensaje = "Ha ocurrido un error.";
      $scope.mensajeLogin.ver = true;
      $scope.mensajeLogin.estilo = "alert-danger";
      console.info("Ha ocurrido un error en Deslogueo(). " + error);
    }
  };

  $scope.Resetear = function (){
    try
    {
      firebase.auth().sendPasswordResetEmail($scope.login.usuario).then(function(resultado){
        $timeout(function() {
          $scope.mensajeLogin.ver = true;
          $scope.mensajeLogin.mensaje = "Email enviado.";
          $scope.mensajeLogin.estilo = "alert-success";
        });
      }).catch(function (error){
        $timeout(function() {
          $scope.mensajeLogin.ver = true;
          $scope.mensajeLogin.mensaje = "No se pudo enviar el mail, intente nuevamente.";
          $scope.mensajeLogin.estilo = "alert-danger";
        });
      });
    }
    catch (error)
    {
      $scope.mensajeLogin.mensaje = "Ha ocurrido un error.";
      $scope.mensajeLogin.ver = true;
      $scope.mensajeLogin.estilo = "alert-danger";
      console.info("Ha ocurrido un error en Resetear(). " + error);
    }
  };

  $scope.VerificarMail = function (){
    try
    {
      firebase.auth().currentUser.sendEmailVerification().then(function(resultado){
        $timeout(function() {
          $scope.cartelVerificar = true;
        });
      }).catch(function (error){
        $timeout(function() {
          $scope.mensajeLogin.ver = true;
          $scope.mensajeLogin.mensaje = "No se pudo enviar el mail, intente nuevamente.";
          $scope.mensajeLogin.estilo = "alert-danger";
        });
      });
    }
    catch (error)
    {
      $scope.mensajeLogin.mensaje = "Ha ocurrido un error.";
      $scope.mensajeLogin.ver = true;
      $scope.mensajeLogin.estilo = "alert-danger";
      console.info("Ha ocurrido un error en VerificarMail(). " + error);
    }
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

.controller('RegistroCtrl', function($scope, $stateParams, $timeout, $state, Servicio) {
  $scope.login = {};
  $scope.login.usuario = "jperez@gmail.com";
  $scope.login.clave = "123456";
  $scope.login.nombre = "Juan Perez";
  $scope.mensajeLogin = {};

  $scope.Registrar = function (){
    $scope.mensajeLogin.ver = false;
    try
    {
    firebase.auth().createUserWithEmailAndPassword($scope.login.usuario, $scope.login.clave)
    .then(function(resultado){
      var fecha = firebase.database.ServerValue.TIMESTAMP;
      var usuario = {
        correo: $scope.login.usuario,
        nombre: $scope.login.nombre,
        saldo: "1000",
        fechaCreacion: fecha,
        fechaAcceso: fecha,
        perfil:"cliente",
        borrado:false 
      };
      Servicio.Guardar('usuario/' + $scope.login.nombre, usuario);
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
        $timeout(function() {
            switch (error.code)
            {
              case "auth/email-already-in-use":
                  $scope.mensajeLogin.mensaje = "El correo ya esta registrado.";
                  $scope.mensajeLogin.ver = true;
                  $scope.mensajeLogin.estilo = "alert-danger";
                break;

            }
            console.info(error.code);
          });
      });
    }
    catch (error)
    {
      $scope.mensajeLogin.mensaje = "Ha ocurrido un error.";
      $scope.mensajeLogin.ver = true;
      $scope.mensajeLogin.estilo = "alert-danger";
      console.info("Ha ocurrido un error en Registrar(). " + error);
    }
  };
})

.controller('ListaUsuariosCtrl', function($scope, $state, $timeout, Servicio) {
  try
  {
    var usuarioLogeado = firebase.auth().currentUser;
    $scope.usuario = {};

    var referenciaUsuario = firebase.database().ref('usuario/' + usuarioLogeado.displayName);
    referenciaUsuario.on('value', function(snapshot) {
      $timeout(function() {
        $scope.usuario = snapshot.val();
      });
    });

    $scope.usuarios = [];

    var referenciaUsuarios = firebase.database().ref('usuario/');
    referenciaUsuarios.on('child_added', function (snapshot) {
      $timeout(function() {
        var usuario = snapshot.val();
        if (usuario.borrado == false) {
            $scope.usuarios.push(usuario);
        }
      });
    });
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en ListaUsuariosCtrl. " + error);
  }

  $scope.VerUsuario = function(usuario){
    try
    {
      var param = JSON.stringify(usuario);
      $state.go('app.verUsuario', {usuario:param});
    }
    catch(error)
    {
      console.info("Ha ocurrido un error en VerUsuario(). " + error);
    }
  };
})

.controller('VerUsuarioCtrl', function($scope, $stateParams, $timeout, $state) {
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

  $scope.usuarioBuscado = {};
  $scope.usuarioBuscado = JSON.parse($stateParams.usuario);
  $scope.Borrar = function(){
      var updates = {};
      updates['/usuario/' + $scope.usuarioBuscado.nombre + '/borrado'] = true;
      updates['/usuario/' + $scope.usuarioBuscado.nombre + '/fechaBorrado'] = firebase.database.ServerValue.TIMESTAMP;
      
      firebase.database().ref().update(updates);

      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has borado el usuario.";
  }

  $scope.Volver = function(){
    $state.go('app.listaUsuarios');
  }
});

