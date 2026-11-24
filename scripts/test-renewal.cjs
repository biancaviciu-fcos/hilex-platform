const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,mocks){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(n in mocks)return mocks[n];throw Error('Unexpected dependency '+n)},process:{env:{}},console:{log(){},error(){}},Intl,Date});return exports}
const content=load('src/lib/cancellationEmail.ts',{'./email':{sendEmail:x=>x}}).cancellationEmailContent({name:'<script>',accessUntil:Date.UTC(2026,11,24,12)/1000,test:true});
assert(content.subject.startsWith('[TEST]'));assert(content.html.includes('&lt;script&gt;'));assert(content.text.includes('24 decembrie 2026'));assert(content.text.includes('Niciun abonament'));
async function scenario({previous=false,cancel=true,snapshotCancel=true,status='active',marker='',sendError=false,dbError=false,missing=false,signature=true,canceledAt=12,snapshotCanceledAt=12}={}){
 const calls={emails:[],metadata:[],sync:[]};
 const sub={id:'sub_test',status,cancel_at_period_end:cancel,current_period_start:10,current_period_end:1900000000,cancel_at:1900000000,canceled_at:canceledAt,metadata:{hilex_cancellation_email_event:marker}};
 const event={id:'evt_test',type:'customer.subscription.updated',data:{object:{...sub,cancel_at_period_end:snapshotCancel,canceled_at:snapshotCanceledAt},previous_attributes:{cancel_at_period_end:previous}}};
 const stripe={webhooks:{constructEvent:()=>event},subscriptions:{retrieve:async()=>sub,update:async(id,data)=>calls.metadata.push(data)}};
 const supabase={from:table=>({update:data=>({eq:async()=>{calls.sync.push(data);return{error:dbError?Error('db'):null}}}),select:()=>({eq:()=>({maybeSingle:async()=>({data:missing?null:{user_id:'u'}}),single:async()=>({data:{email:'test@example.com',full_name:'Test'}})})})})};
 const route=load('src/app/api/stripe/webhook/route.ts',{'next/headers':{headers:async()=>({get:()=>signature?'sig':null})},'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},stripe:{},'@/lib/stripe':{getStripe:()=>stripe},'@/lib/supabase/admin':{createSupabaseAdminClient:()=>supabase},'@/lib/membershipEmail':{},'@/lib/cancellationEmail':{sendCancellationEmail:async input=>{if(sendError)throw Error('email failed');calls.emails.push(input)}}});
 let error;try{calls.result=await route.POST({text:async()=>''})}catch(e){error=e}return{...calls,error};
}
(async()=>{
 let r=await scenario();assert.equal(r.emails.length,1);assert.equal(r.emails[0].idempotencyKey,'hilex-cancellation/evt_test');assert.equal(r.metadata.length,1);assert.equal(r.sync[0].status,'active');
 for(const options of [{previous:true},{cancel:false},{status:'canceled'},{marker:'evt_test'},{canceledAt:13}]){r=await scenario(options);assert.equal(r.emails.length,0);assert.equal(r.metadata.length,0)}
 r=await scenario({sendError:true});assert(r.error);assert.equal(r.metadata.length,0);
 r=await scenario({dbError:true});assert(r.error);assert.equal(r.emails.length,0);
 r=await scenario({missing:true});assert(r.error);assert.equal(r.emails.length,0);
 r=await scenario({signature:false});assert.equal(r.result.status,400);assert.equal(r.sync.length,0);
 console.log('PASS: cancellation transition, access preservation, replay protection, stale events, email/DB retries, signature requirement, escaped test email.');
})().catch(e=>{console.error(e);process.exitCode=1});
