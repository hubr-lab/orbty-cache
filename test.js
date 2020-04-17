const oCache = require("./index");

const c = oCache(1);

function pro(el) {
  const res = {
    send: (body) => {
      console.log("Sended", body);
    }
  };

  const req = {
    headers: {},
    url: "/user/1"
  };

  const next = () => {
    console.log("Processing...");
    setTimeout(() => {
      res.send({ a: 1 });
      pro(c);
    }, 5000);
  };
  el(req, res, next);
}

pro(c);
