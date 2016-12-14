// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 
  'starter.controllers', 
  'starter.login',
  'starter.desafio',
  'starter.desafios',
  'starter.servicio',
  'starter.factoryUsuario'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('login', {
    url: '/login',
    cache:false,
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('loginSalir', {
    url: '/loginSalir',
    templateUrl: 'templates/loginSalir.html',
    controller: 'LoginCtrl'
  })

  .state('registro', {
    url: '/registro',
    cache:false,
    templateUrl: 'templates/registro.html',
    controller: 'RegistroCtrl'
  })

  .state('app.listaUsuarios', {
      url: '/listaUsuarios',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/listaUsuarios.html',
          controller: 'ListaUsuariosCtrl'
        }
      }
  })

  .state('app.verUsuario', {
    url: '/verUsuario/:usuario',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/verUsuario.html',
        controller: 'VerUsuarioCtrl'
      }
    }
  })

  .state('app.perfil', {
    url: '/perfil',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/perfil.html',
        controller: 'PerfilCtrl'
      }
    }
  })

  .state('app.desafio', {
    url: '/desafio',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/desafio.html',
        controller: 'DesafioCtrl'
      }
    }
  })

  .state('app.desafioVer', {
    url: '/desafioVer/:desafio',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/desafioVer.html',
        controller: 'DesafioVerCtrl'
      }
    }
  })

  .state('app.salaDesafios', {
      url: '/salaDesafios',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/salaDesafios.html',
          controller: 'SalaDesafiosCtrl'
        }
      }
  })

  .state('app.misDesafios', {
      url: '/misDesafios',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/misDesafios.html',
          controller: 'MisDesafiosCtrl'
        }
      }
  })

  .state('app.verificarDesafios', {
      url: '/verificarDesafios',
      cache:false,
      views: {
        'menuContent': {
          templateUrl: 'templates/verificarDesafios.html',
          controller: 'VerificarDesafiosCtrl'
        }
      }
  })

  .state('app.desafioVerificar', {
    url: '/desafioVerificar/:desafio',
    cache:false,
    views: {
      'menuContent': {
        templateUrl: 'templates/desafioVerificar.html',
        controller: 'DesafioVerificarCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
