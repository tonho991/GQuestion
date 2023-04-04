const {
  initializeApp
} = require('firebase/app');
const {
  getDatabase,
  ref,
  onValue,
  update,
  get,
  child
} = require('firebase/database');
const {
  firebaseConfig
} = require('../constants/api');

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


async function checkRequests(userId, timezone) {
  return new Promise(async function(resolve, reject) {
    const startCountref = ref(db, `users/${userId}`);
    const dbRef = ref(db);

    await get(child(dbRef, `users/${userId}`)).then(snapshot => {
      const user = snapshot.val();
      if (!user) {
        resolve({
          msg: `Usuário não encontrado.`,
          success: false
        });
        return;
      }

      const moment = require('moment-timezone');
      const local = moment().tz(timezone);
      const now = local.valueOf();



      if (user.lastReq && now - user.lastReq < 24 * 60 * 60 * 1000) {
        if (user.userReqs && user.userReqs == 10) {
          resolve({
            msg: `Você já fez 10 requisições nas últimas 24 horas.`,
            success: false
          });
          return;
        }

      } else {
        update(startCountref, {
          userReqs: 5
        });
      }

      const novaRequisicao = {
        data: now,
        numero: user.userReqs ? user.userReqs + 1: 1
      };

      update(startCountref, {
        lastReq: now,
        userReqs: novaRequisicao.numero
      }).then(()=> {
        resolve({
          msg: "Sucesso",
          success: true
        });
      });
    }).catch((err) => {
      resolve({
        msg: `Erro ao atualizar registro do usuário.`,
        success: false
      });
    });

  });
}



module.exports = {
  checkRequests
};