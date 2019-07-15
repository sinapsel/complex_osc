var g = -9.8, dt = 1e-2, sqrt = Math.sqrt, pi = Math.PI, e = Math.e,
 exp = Math.exp, sin = Math.sin, cos = Math.cos, abs = Math.abs,

 AGM = function(a, b) {
   agm_accuracy = 1000;
   var _agm = function(a, b, iter) {
     if (iter > 0)
      return (_agm((a+b)/2, sqrt(a, b), --iter));
     return b;
   }
   return _agm(a, b, agm_accuracy);
 };

var plot = {};
var settings_block = {};
var pendulums = [];

function pendulum_toogle(id) {
  this.id = id;
  this.inner = `<p>#${id}</p><p>Length:<br/><input type=\"number\" id=\"length-${id}\" min=\"1\" step=\"1\" value=\"25\" onclick=\"change_toogles(this)\"/></p><p>Radius<br/><input type=\"number\" id=\"radius-${id}\" min=\"3\" max=\"10\" step=\"1\" value=\"5\" onclick=\"change_toogles(this)\" /></p><p>Angular amplitude (deg):<br/><input type=\"number\" id=\"ampl-${id}\" min=\"-180\" max=\"180\" step=\"0.5\" value=\"30\" onclick=\"change_toogles(this)\"/></p><p>Trace?<br/><input type=\"checkbox\" id=\"chkbox-${id}\" checked/></p>`
  this.elem = document.createElement('div');
  this.elem.className = "pend";
  this.elem.id = `pend-${id}`;
  this.elem.innerHTML = this.inner;
  this.draw = function() {document.getElementById('pendbox').appendChild(this.elem);}
}

function change_tooglebox() {
  let pendbox = document.getElementById('pendbox');
  pendbox.innerHTML = '';
  settings_block.toogles = [];
  pendulums = [];
  let N = parseInt(document.getElementById('amount').value);
  //pendulums.push(new pendulum(plot.base_origin, pi/6, 5, 25, true));
  pendulums.push(new pendulum(0, plot.base_origin, 0, 0, 0, true));
  for (var i = 1; i <= N; ++i) {
    settings_block.toogles[i] = new pendulum_toogle(i);
    settings_block.toogles[i].draw();
    change_toogles({id: i.toString()});
  }
  settings_block.reset();
  plot.canvas.height = document.getElementById('panel').offsetHeight;
}

  function change_toogles(elem) {
    settings_block.reset();
    var idx = abs(parseInt(elem.id.match(/\d+/)));
    console.log(idx);
    function get_block_value(type) {
      return parseInt(document.getElementById(type + '-' + idx).value);
    }
    pendulums[idx] = new pendulum(
      idx,
      pendulums[idx - 1].position,
      get_block_value('ampl')*pi/180,
      get_block_value('radius'),
      get_block_value('length'),
      true
    );
  }

function pendulum(idx, origin, angular_amplitude, radius, length, is_traceable) {
  this.idx = idx;
  this.origin = origin;
  this.angular_amplitude = angular_amplitude;
  this.radius = radius;
  this.length = length;
  this.position = {x: this.origin.x + sin(this.angular_amplitude) * this.length,
                   y: this.origin.y + cos(this.angular_amplitude) * this.length};
  this.is_traceable = is_traceable;
  //this.T = 2*pi*sqrt(this.length/g) / AGM(1, cos(angular_amplitude / 2));

  this.angle = this.angular_amplitude;
  this.velocity = 0;
  this.acceleration = 0;

  this.draw = function() {
    if (idx > 0)
      this.origin = pendulums[idx-1].position;
    this.position = {x: this.origin.x + sin(this.angle) * this.length,
                     y: this.origin.y + cos(this.angle) * this.length};
    plot.ctx.beginPath()
	  plot.ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*pi)
	  plot.ctx.fill()
	  plot.ctx.moveTo(this.origin.x, this.origin.y);
	  plot.ctx.lineTo(this.position.x, this.position.y);
	  plot.ctx.stroke();
    plot.ctx.closePath();
    //console.log(this.position);
  };

  this.calculus = function() {
    this.acceleration = sin(this.angle) * this.length / g;
	  this.velocity +=  this.acceleration * dt;
	  this.angle += this.velocity * dt;
    //console.log(this.angle);
  };
}

function draw() {
  settings_block.reset();
  pendulums.forEach(function(_pend) {
    _pend.draw();
    _pend.calculus();
  });
  if (!settings_block.is_stoped)
    requestAnimationFrame(draw);
}

window.onload = function() {
  plot.canvas = document.getElementById('canvas');
  plot.ctx = plot.canvas.getContext('2d');
  plot.size = {
    width: plot.canvas.width = 600,
    height: plot.canvas.height = 600
  };
  plot.base_origin = {x: plot.canvas.width / 2, y: 0};

  document.getElementById('amount').value = 1;

  settings_block.toogles = [];
  settings_block.is_stoped = true;
  settings_block.reset = function() {
    plot.ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  settings_block.play = function() {
    settings_block.is_stoped ^= 1;
    draw();
  };
  change_tooglebox();
};
