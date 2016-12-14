angular.module('starter.batallas', [])

.controller('SalaBatallasCtrl', function($scope, $state, $timeout, Servicio, FactoryUsuario) {
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

    $scope.ListaBatallas = [];

    Servicio.Cargar('/batalla').on('child_added',function(snapshot)
    { 
      $timeout(function(){
        var batalla = snapshot.val();
        if (batalla.aceptada == false)
          $scope.ListaBatallas.push(batalla);
      });
    });

  }
  catch(error)
  {
    console.info("Ha ocurrido un error en SalaDesafiosCtrl. " + error);
  }

  $scope.VerBatalla = function(batalla){
    var param = JSON.stringify(batalla);
    $state.go('batallaVer', {batalla:param});
  };

  $scope.Menu = function(){
    $state.go("menu");
  }

})
.controller('MisBatallasCtrl', function($scope, $state, $timeout, Servicio, FactoryUsuario) {
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
    $scope.buscar = {};
    $scope.buscar.filtro = "Activas";
    $scope.buscando = false;
    $scope.ListaBatallas = [];

    Servicio.Cargar('/batalla').on('child_added',function(snapshot)
    { 
      $timeout(function(){
        var batalla = snapshot.val();
        if (batalla.usuarioCreador.nombre == $scope.usuario.nombre || batalla.usuarioAcepta.nombre == $scope.usuario.nombre)
        {
          switch ($scope.buscar.filtro)
          {
            case "Activas":
                if (batalla.aceptada == true && batalla.finalizada == false)
                  $scope.ListaBatallas.push(batalla);
              break;

            case "Finalizadas":
                if (batalla.finalizada == true)
                  $scope.ListaBatallas.push(batalla);
              break;

            case "Tu turno":
                if (batalla.aceptada == true && batalla.finalizada == false && batalla.turno.nombre == $scope.usuario.nombre)
                  $scope.ListaBatallas.push(batalla);
              break;
          }
        }
      });
    });
  }
  catch(error)
  {
    console.info("Ha ocurrido un error en MisBatallasCtrl. " + error);
  }

  $scope.Busqueda = function(){
    try
    {
      $scope.buscando = true;
      $scope.ListaBatallas = [];
      Servicio.Cargar('/batalla').on('child_added',function(snapshot)
      { 
        $timeout(function(){
          var batalla = snapshot.val();
          if (batalla.usuarioCreador.nombre == $scope.usuario.nombre || batalla.usuarioAcepta.nombre == $scope.usuario.nombre)
          {
            switch ($scope.buscar.filtro)
            {
              case "Activas":
                  if (batalla.aceptada == true && batalla.finalizada == false)
                    $scope.ListaBatallas.push(batalla);
                break;

              case "Finalizadas":
                  if (batalla.finalizada == true)
                    $scope.ListaBatallas.push(batalla);
                break;

              case "Tu turno":
                  if (batalla.aceptada == true && batalla.finalizada == false && batalla.turno.nombre == $scope.usuario.nombre)
                    $scope.ListaBatallas.push(batalla);
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

  $scope.JugarBatalla = function(batalla){
    var param = JSON.stringify(batalla);
    $state.go('batallaJugar', {batalla:param});
  };

  $scope.Menu = function(){
    $state.go("menu");
  }

})
;
