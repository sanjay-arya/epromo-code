import {getRepository} from "typeorm";
import { Code } from "./entity/Code";
import * as QRCode from 'qrcode'
import * as fs from 'fs';

function randomNumber(){
  return Math.floor(Math.random()*899999+100000)
}
function randomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = '';
  for (var i = 5; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

async function generateCode({evoucher, user, phone, itemPrice}){

  let codeRepository = getRepository(Code);
  
  let code = randomNumber()+randomString();
  // let code = "777598eb18w";
  try {
      await codeRepository.save({
          evoucher,
          user,
          phone,
          code,
          'amount': itemPrice,
          'qr': `${code}.png`
      })
      return code;
  } catch (error) {
      if(error.code == 'ER_DUP_ENTRY'){
          console.log(error);
          return generateCode({evoucher, user, phone, itemPrice})
      }
  }
}

async function generateQR(code)
{
    let image = await QRCode.toDataURL(code)
    image = image.replace(/^data:image\/\w+;base64,/, '');

    fs.writeFileSync(`img/${code}.png`, image, {encoding: 'base64'});
    return {code, image};
}

export {
  generateCode,
  generateQR
}