import * as Queue from 'bee-queue';
import RedisConfig from './config/redis';
import {createConnection} from "typeorm";
import {generateCode, generateQR} from "./utils";

createConnection().then(async connection => {

    const purchaseQueue = new Queue('purchase', RedisConfig);
    const promoCodeQueue = new Queue('promoCode', RedisConfig);
    const transferQueue = new Queue('transferQueue', RedisConfig);

    purchaseQueue.process((job, done)=>{
        console.log(job.data);
        let {evoucher, user, phone, quantity, itemPrice} = job.data;
        for (let i = 0; i < quantity; i++) {
            // Runs 5 times, with values of step 0 through 4.
            promoCodeQueue.createJob({evoucher, user, phone, itemPrice}).save();
        }
        console.log(job.data);
        done();
    })

    promoCodeQueue.process(10, async (job, done)=>{
        console.log(job.data);
        let data = job.data;
        let code = await generateCode(data);
        var qr = await generateQR(code);
        transferQueue.createJob(qr).save()
        done();
    })
    
}).catch(error => console.log(error));