var quickconnect = require('..');
var test = require('tape');
var uuid = require('uuid');
var connections = [];
var dcs = [];
var roomId = uuid.v4();

test('create connection:0 (id = "a")', function(t) {
  var qc;

  t.plan(1);
  qc = connections[0] = quickconnect(location.origin, { id: 'a', room: roomId });
  t.equal(qc.id, 'a', 'created with specified id');

  qc.createDataChannel('test');
});

test('create connection:1 (id = "b")', function(t) {
  var qc;

  t.plan(1);
  qc = connections[1] = quickconnect(location.origin, { id: 'b', room: roomId });
  t.equal(qc.id, 'b', 'created with specified id');

  qc.createDataChannel('test');
});

test('wait for data channels', function(t) {
  t.plan(2);
  if (dcs[0] = connections[0].getChannel(connections[1].id, 'test')) {
    t.pass('dc:0 open');
  }
  else {
    connections[0].once('test:open', function(id, dc) {
      dcs[0] = dc;
      t.equal(dc.readyState, 'open', 'connection test dc 0 open');
    });
  }

  if (dcs[1] = connections[1].getChannel(connections[0].id, 'test')) {
    t.pass('dc:1 open');
  }
  else {
    connections[1].once('test:open', function(id, dc) {
      dcs[1] = dc;
      t.equal(dc.readyState, 'open', 'connection test dc 1 open');
    });
  }
});

test('dc 0 send', function(t) {
  dcs[1].onmessage = function(evt) {
    t.equal(evt.data, 'hi', 'dc:1 received hi');
    dcs[1].onmessage = null;
  };

  t.plan(1);
  dcs[0].send('hi');
});

test('dc 1 send', function(t) {
  dcs[0].onmessage = function(evt) {
    t.equal(evt.data, 'hi', 'dc:1 received hi');
    dcs[0].onmessage = null;
  };

  t.plan(1);
  dcs[1].send('hi');
});

test('release references', function(t) {
  t.plan(1);
  connections.splice(0).forEach(function(conn, index) {
    conn.close();
  });

  dcs = [];
  t.pass('done');
});