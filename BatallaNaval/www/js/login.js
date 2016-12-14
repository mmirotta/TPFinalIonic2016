angular.module('starter.login', [])

.controller('LoginCtrl', function($scope, $stateParams, $timeout, $state, Servicio, FactoryUsuario) {
  $scope.logueado = 'no';
  $scope.verificado = 'no';

  $scope.login = {};
  $scope.login.usuario = "m.mirotta@gmail.com";
  $scope.login.clave = "123456";

  $scope.mensajeLogin = {};
  $scope.mensajeLogin.ver = false;
  $scope.ingresando = false;
  $scope.Logear = function (){
    $scope.mensajeLogin = {};
    $scope.mensajeLogin.ver = false;
    $scope.ingresando = true;
    firebase.auth().signInWithEmailAndPassword($scope.login.usuario, $scope.login.clave)
    .then( function(resultado){
      var usuario = firebase.auth().currentUser;
      var updates = {};
      updates['/usuario/' + usuario.displayName + '/fechaAcceso'] = firebase.database.ServerValue.TIMESTAMP;
      Servicio.Editar(updates);

      Servicio.Cargar('/usuario/' + usuario.displayName).on('value',
          function(respuesta) {
            $timeout(function() {
              FactoryUsuario.Logueado = respuesta.val();
              $scope.logueado = 'si';
              if (usuario.emailVerified == false)
              {
                $scope.verificado = 'no';
              }
              else
              {
                $scope.verificado = 'si';
                $state.go('menu');
              }
            }, 1000);
          },
          function(error) {
            // body...
          }
      );
    }, function (error){
        $timeout(function() {
          switch (error.code)
          {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-email":
                $scope.mensajeLogin.mensaje = "Correo o contraseña incorrectos.";
                $scope.mensajeLogin.ver = true;
              break;

          }
          $scope.ingresando = false;
        }, 1000);
    });
  };

  $scope.Deslogear = function (){
    try
    {
      $scope.mensajeLogin = {};
      $scope.mensajeLogin.ver = false;
      firebase.auth().signOut().catch(function (error){
          $scope.mensajeLogin.ver = true;
          $scope.ingresando = false;
          $scope.mensajeLogin.mensaje = "No se pudo salir de la aplicación, intente nuevamente.";
          $scope.mensajeLogin.estilo = "alert-danger";
      }).then( function(resultado){
        $timeout(function() {
          FactoryUsuario.Logueado = null;
          $state.go("login");
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

  $scope.Menu = function(){
    $state.go("menu");
  }

})

.controller('RegistroCtrl', function($scope, $stateParams, $timeout, $state, Servicio, FactoryUsuario) {
  $scope.login = {};
  $scope.login.usuario = "jperez@gmail.com";
  $scope.login.clave = "123456";
  $scope.login.nombre = "Juan Perez";

  $scope.logueado = 'no';
  $scope.verificado = 'no';

  $scope.mensajeLogin = {};
  $scope.mensajeLogin.ver = false;

  $scope.registrando = false;

  $scope.Registrar = function (){
    $scope.mensajeLogin.ver = false;
    $scope.registrando = true;
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
            $timeout(function() {
              $scope.logueado = 'si';
              $scope.verificado = 'no';
              $scope.registrando = false;
            });
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

  $scope.Volver = function()
  {
    $state.go("login");
  }
})

.controller('ListaUsuariosCtrl', function($scope, $state, $timeout, Servicio) {
  try
  {
    $scope.usuarios = Servicio.Buscar('usuario/');
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en ListaUsuariosCtrl. " + error);
  }

  $scope.VerUsuario = function(usuario){
    try
    {
      var param = JSON.stringify(usuario);
      $state.go('verUsuario', {usuario:param});
    }
    catch(error)
    {
      console.info("Ha ocurrido un error en VerUsuario(). " + error);
    }
  };

  $scope.Menu = function(){
    $state.go("menu");
  }

  $scope.Salir = function(){
    $state.go("login"); 
  }
})

.controller('VerUsuarioCtrl', function($scope, $stateParams, $timeout, $state, Servicio) {
  $scope.mensaje = {};
  $scope.mensaje.ver = false;

  $scope.usuarioBuscado = JSON.parse($stateParams.usuario);
  $scope.Borrar = function(){
      var updates = {};
      updates['/usuario/' + $scope.usuarioBuscado.nombre + '/borrado'] = true;
      updates['/usuario/' + $scope.usuarioBuscado.nombre + '/fechaBorrado'] = firebase.database.ServerValue.TIMESTAMP;
      
      Servicio.Editar(updates);

      $scope.mensaje.ver = true;
      $scope.mensaje.mensaje = "Has borado el usuario.";
  }

  $scope.Volver = function(){
    var param = JSON.stringify($scope.usuario);
    $state.go("listaUsuarios", {usuario:param});
  }

  $scope.Menu = function(){
    $state.go("menu");
  }

  $scope.Salir = function(){
    $state.go("login"); 
  }
});

