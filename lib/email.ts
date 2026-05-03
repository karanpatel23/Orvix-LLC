import nodemailer from 'nodemailer';
import { Resend } from 'resend';
export async function sendQuoteEmail(payload: Record<string, unknown>) {
const to=process.env.CONTACT_TO_EMAIL||'info@orvixllc.com'; const from=process.env.CONTACT_FROM_EMAIL;
if(process.env.RESEND_API_KEY&&from){const resend=new Resend(process.env.RESEND_API_KEY);await resend.emails.send({to,from,subject:'ORVIX Quote Request',text:JSON.stringify(payload,null,2)});return {sent:true};}
if(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS&&from){const t=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});await t.sendMail({to,from,subject:'ORVIX Quote Request',text:JSON.stringify(payload,null,2)});return {sent:true};}
return {sent:false};
}
