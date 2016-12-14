angular.module('starter.desafios', [])

.controller('SalaDesafiosCtrl', function($scope, $state, $timeout, FactoryUsuario) {
  try
  {
    if (firebase.auth().currentUser != null)
      {
        $timeout(function(){
          $scope.usuario = FactoryUsuario.Logueado;
        });
      }
      else
      {
        $state.go("login");
    }

    $scope.desafios = [];

    var referenciaDesafios = firebase.database().ref('desafio/');
    referenciaDesafios.on('child_added', function (snapshot) {
      $timeout(function() {
        var desafio = snapshot.val();
        desafio.pagina = "salaDesafios";
        if (desafio.aceptada == false && desafio.finalizada == false && desafio.expirada == false) {
          var fecha = new Date(desafio.fechaCreacion)
          var fechaActual = new Date();
          fecha.setHours(fecha.getHours() + desafio.vencimiento);
          if (fecha > fechaActual)
          {
            $scope.desafios.push(desafio);
          }
          else
          {
            var updateDesafio = {};
            updateDesafio['/desafio/' + desafio.titulo + '/expirada'] = true;
            updateDesafio['/desafio/' + desafio.titulo + '/fechaAceptada'] = firebase.database.ServerValue.TIMESTAMP;
            
            firebase.database().ref().update(updateDesafio);

            var updateUsuarioReserva = {};
            updateUsuarioReserva['/reserva/' + desafio.usuarioCreador.nombre + '/' + desafio.titulo + '/monto'] = 0;
            updateUsuarioReserva['/reserva/' + desafio.usuarioCreador.nombre + '/' + desafio.titulo + '/vencido'] = true;
            
            firebase.database().ref().update(updateUsuarioReserva);

            firebase.database()
            .ref('usuario/' + desafio.usuarioCreador.nombre + '/expiradas/' + desafio.titulo).set(desafio);
          }
        }
      });
    });
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en SalaDesafiosCtrl. " + error);
  }

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  };

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
  };
})

.controller('MisDesafiosCtrl', function($scope, $state, $timeout, FactoryUsuario) {
  try
  {
    if (firebase.auth().currentUser != null)
      {
        $timeout(function(){
          $scope.usuario = FactoryUsuario.Logueado;
        });
      }
      else
      {
        $state.go("login");
    }

    $scope.desafios = [];
    $scope.buscar = {};
    $scope.buscar.filtro = "Activas";
    $scope.buscando = false;
    
    var referenciaDesafios = firebase.database().ref('desafio/');
    referenciaDesafios.on('child_added', function (snapshot) {
      $timeout(function() {
        var desafio = snapshot.val();
        desafio.pagina = "misDesafios";
        if (desafio.usuarioCreador.nombre == $scope.usuario.nombre || desafio.usuarioAcepta.nombre == $scope.usuario.nombre)
        {
          switch ($scope.buscar.filtro)
          {
            case "Activas":
              if (desafio.aceptada == true && desafio.finalizada == false && desafio.expirada == false)
                $scope.desafios.push(desafio);
              break;

            case "Finalizadas":
              if (desafio.aceptada == false && desafio.finalizada == true && desafio.expirada == false)
                $scope.desafios.push(desafio);
              break;

            case "Expirada":
              if (desafio.expirada == true)
              {
                desafio.resultado = "Expirada";
                $scope.desafios.push(desafio);
              }

              break;
          }
        }        
      });
    });
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en MisDesafiosCtrl. " + error);
  }

  $scope.Busqueda = function(){
    try
    {
      $scope.buscando = true;
      $scope.desafios = [];
      var referenciaDesafios = firebase.database().ref('desafio/');
      referenciaDesafios.on('child_added', function (snapshot) {
        $timeout(function() {
          var desafio = snapshot.val();
          desafio.pagina = "misDesafios";
          if (desafio.usuarioCreador.nombre == $scope.usuario.nombre || desafio.usuarioAcepta.nombre == $scope.usuario.nombre)
          {
            switch ($scope.buscar.filtro)
            {
              case "Activas":
                if (desafio.aceptada == true && desafio.finalizada == false && desafio.expirada == false)
                  $scope.desafios.push(desafio);
                break;

              case "Finalizadas":
                if (desafio.aceptada == false && desafio.finalizada == true && desafio.expirada == false)
                  $scope.desafios.push(desafio);
                break;

              case "Expirada":
                if (desafio.expirada == true)
                {
                  desafio.resultado = "Expirada";
                  $scope.desafios.push(desafio);
                }

                break;
            }
          }        
        });
      });
      $scope.buscando = false;
    }
    catch (error)
    {
      console.info("Ha ocurrido un error en MisBatallasCtrl-Buscar. " + error);
    }
  };

  $scope.NuevoDesafio = function(){
    $state.go('app.desafio');
  }

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVer', {desafio:param});
  }
})

.controller('VerificarDesafiosCtrl', function($scope, $state, $timeout) {
  try
  {
    $scope.desafios = [];

    var referenciaDesafios = firebase.database().ref('desafio/');
    referenciaDesafios.on('child_added', function (snapshot) {
      $timeout(function() {
        var desafio = snapshot.val();
        desafio.pagina = "verificarDesafios";
        if ((desafio.aceptada == true) && (desafio.finalizada == false))
        {
          var fecha = new Date(desafio.fechaCreacion)
          var fechaActual = new Date();
          fecha.setHours(fecha.getHours() + desafio.vencimiento);
          if (fecha > fechaActual)
          {
            $scope.desafios.push(desafio);
          }
        }
      });
    });
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en MisDesafiosCtrl. " + error);
  }

  $scope.VerDesafio = function(desafio){
    var param = JSON.stringify(desafio);
    $state.go('app.desafioVerificar', {desafio:param});
  }
});
