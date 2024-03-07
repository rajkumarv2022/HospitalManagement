import { Hono } from 'hono'
import { bearerAuth } from 'hono/bearer-auth';
import { cors } from 'hono/cors'

// type hospital = {

//   pat_id:number;
//   pat_name:string;
//   pat_desc:string;
//   pat_date:string;
//   pat_phn:number;

// };

type Bindings = {


    DB:D1Database; 
    AUTH_TOKEN:'12345';

};

const app = new Hono<{Bindings:Bindings}>();


app.use(
  '/*',
  cors({
      origin:'http://localhost:5173',
      allowMethods:['POST','GET','OPTIONS','DELETE']
  })
)


//set bearel authentication

app.on('all','/*',async(c,next) => {

    const applyAuth = bearerAuth({token : c.env.AUTH_TOKEN});

    return applyAuth(c,next);

})


//create or add patient

app.post('/patient',async(c) => {

  const {pat_id,pat_name,pat_desc,pat_date,pat_phno} = await c.req.json();

const{success} = await c.env.DB.prepare(`INSERT INTO hospital (pat_id,pat_name,pat_desc,pat_date,pat_phno) values (?,?,?,?,?);`).bind(pat_id,pat_name,pat_desc,pat_date,pat_phno).run();

 if(success)
 {
  return c.text('Patient added successfully');
 }

 else
 {
  return c.text("Patient was not added");
 }

});


//get all patient

app.get('/patient/get-all',async(c) => {

      const patient = await c.env.DB.prepare(`SELECT * FROM hospital`).all();

      return c.json(patient);

} );


//get patient by id

app.get('/patient/:id',async(c) => {

      const id = c.req.param('id');

      const patient = await c.env.DB.prepare(`SELECT * FROM hospital where pat_id = ${id}`).all();

    

      return c.json(patient);

})


//delete patient by id

app.delete('/delete/:id',async(c) => {


    const id = c.req.param('id');

     await c.env.DB.prepare(`DELETE FROM hospital WHERE pat_id = ${id} `).run();

      return c.text("successfully deleted");
   
});

// delete all patient

app.delete('/delete',async(c) => {

    await c.env.DB.prepare('DELETE FROM hospital').all();

    return c.text('successfully all student was deleted');

})



app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
