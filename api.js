module.exports = function(fetch) {
  var namespaces = require('./api-methods.js');

  function addMethods(obj) {
    namespaces.forEach(function(namespace) {
      obj[namespace.name] = namespace.methods.reduce(function(result, method) {
        result[method] = function(params, callback) {
          return obj.send(namespace.name + '.' + method, params, callback);
        };
        return result;
      }, {});
    });
  }

  function Kodi(ip, port, credentials) {
    this.url = 'http://' + ip + ':' + port + '/jsonrpc';
    this.credentials = credentials;
    addMethods(this);
  }

  Kodi.prototype.sendHTTP = function(body, callback) {
    var headers = {
      "Content-type": "application/json",
      'Accept': "application/json"
    };

    if (this.credentials) {
      var {username, password} = this.credentials;
      headers['Authorization'] = `Basic ${new Buffer(`${username}:${password}`).toString()}`;
    }

    return fetch(this.url, {
        method: 'POST',
        body: body,
        headers: headers
      })
      .then(function (response) {
        return response.json();
      })
      .then(function(data) {
        if(callback) callback(data);
        return data;
      });
  };

  Kodi.prototype.send = function(method, params, callback) {
    var body = {
      jsonrpc: "2.0",
      id: 1,
      method: method
    };

    if(params) body.params = params;
    body = JSON.stringify(body);
    return this.sendHTTP(body, callback);
  };

  return Kodi;
};
