const express = require('express');
const router = express.Router();
const Users = require('../models/Users');
const passport = require('passport')
const auth = require('../helpers/auth')
const chat_mensaje = require('../models/chat_mensaje')
const CartModel = require('../models/Carrito_compras')
const productodb = require('../models/Productos')
const tallas_producto = require('../models/tallas_producto')
const new_categoria = require('../models/Categoria_model')
const new_tipo = require('../models/tipo_model')
const new_marca = require('../models/Marca_model')
//__________________________________________________________________________
router.post('/Agregar_marca', async (req, res) => {
  var marca_new = req.body.cate
  if (marca_new != null) {
    marca_new = marca_new.toUpperCase()
    var marca = new new_marca({ Nombre_marca: marca_new })
    await marca.save()
    llenar_select_marca(req, res)
  } else {
    llenar_select_marca(req, res)
  }
})
router.post('/llenar_ventana_marca', async (req, res) => {
  if (req.body.dato != null) {
    var id = req.body.dato
    await new_marca.findByIdAndDelete({ _id: id })
  }
  llenar_ventana_marca(req, res)
})

async function llenar_ventana_marca(req, res) {
  await new_marca.find({}, (error, all_marca) => {
    res.render('../views/Componentes/lista_marca', { layout: false, all_marca });
  })
}

async function llenar_select_marca(req, res) {
  await new_marca.find({}, (error, all_marca) => {
    res.render('../views/Componentes/marca', { layout: false, all_marca });
  })
}

//____________________________________________________________________________

router.post('/Agregar_categoria', async (req, res) => {
  var categoria_new = req.body.cate
  if (categoria_new != null) {
    categoria_new = categoria_new.toUpperCase()
    var cat = new new_categoria({ Nombre_categoria: categoria_new })
    await cat.save()
    llenar_select_categoria(req, res)
  } else {
    llenar_select_categoria(req, res)
  }
})
router.post('/llenar_ventana_categoria', async (req, res) => {
  if (req.body.dato != null) {
    var id = req.body.dato
    await new_categoria.findByIdAndDelete({ _id: id })
  }
  llenar_ventana(req, res)
})


async function llenar_select_categoria(req, res) {
  await new_categoria.find({}, (error, all_cate) => {
    res.render('../views/Componentes/categorias', { layout: false, all_cate });
  })
}

async function llenar_ventana(req, res) {
  await new_categoria.find({}, (error, all_cate) => {
    res.render('../views/Componentes/lista_categorias', { layout: false, all_cate });
  })
}


//____________________________________________________________________________
router.post('/Agregar_tipos', async (req, res) => {
  var tipo_new = req.body.cate
  if (tipo_new != null) {
    tipo_new = tipo_new.toUpperCase()
    var tipo = new new_tipo({ Nombre_tipo: tipo_new })
    await tipo.save()
    poner_tipos(req, res)
  } else {
    poner_tipos(req, res)
  }
})
router.post('/put_tipos', async (req, res) => {
  if (req.body.dato != null) {
    var id = req.body.dato
    await new_tipo.findByIdAndDelete({ _id: id })
  }
  get_lista_producto(req, res)
})
async function poner_tipos(req, res) {
  await new_tipo.find({}, (error, all_tipos) => {
    res.render('../views/Componentes/Tipos_productos', { layout: false, all_tipos });
  })
}
async function get_lista_producto(req, res) {
  await new_tipo.find({}, (error, all_tipos) => {
    res.render('../views/Componentes/lista_productos', { layout: false, all_tipos });
  })
}
//____________________________________________________________________________________________
router.get('/index/carrito', auth.isAuthenticatedadmin, function (req, res, next) {
  var id_user = req.session.passport.user._id
  CartModel.find({ id_user: id_user }, function (err, car) {
    productodb.populate(car, { path: 'id_producto' }, function (err, carr, indice) {
      var valortotal = 0;
      carr.forEach(function (carritoUno) {
        valortotal += Number(carritoUno.id_producto.PrecioPro)
      });
      res.render('../views/Componentes/Detalles_carrito', { layout: 'admin', carr, valortotal });
    })
  })
})

router.get('/signin', auth.isNotAuthenticated, function (req, res) {
  res.render('../views/users/signin');
})
router.get('/signinup', function (req, res) {
  res.render('../views/users/signup');
})
router.post('/signinup', async function (req, res) {
  let { name, email, password, confirm_password } = req.body
  let role = 'admin'
  let error = []
  if (name == '') {
    error.push('Please insert your name')
  }
  if (password != confirm_password) {
    error.push('Password do not match')
  }
  if (password.lenght < 4) {
    error.push('Password must be at least 4 characters')
  }
  var len = error.length
  if (len > 0) {
    res.render('../views/users/signup', { error, name, email, password, confirm_password });
  } else {
    var Emailuser = await Users.findOne({ email: email }, async function (err, user) {
      if (err) {
        req.flash('success_msg', err)
        return res.redirect('/signinup')
      }
      if (user) {
        req.flash('success_msg', 'El email ya existe.')
        return res.redirect('/signinup')
      } else {
        const NewUser = new Users({ name: name, email: email, password: password, role: role })
        NewUser.password = await NewUser.encryptPass(password)
        NewUser.save()
        res.redirect('/notes/add')
      }
    })
  }
})
router.post('/users/signin', function (req, res, next) {
  passport.authenticate('local-login', function (err, user) {
    if (user) {
      if (user.role === 'usuario') {
        req.logIn(user, function (err) {
          if (err) { return next(err); }
          req.session.role = user.role
          return res.redirect('/profile');
        })
      }
      if (user.role === 'admin') {
        req.logIn(user, function (err) {
          if (err) { return next(err); }
          user.role
          req.session.role = user.role
          return res.redirect('/admin');
        })
      }
    } else {
      req.flash('success_msg', err)
      return res.redirect('/signin');
    }
  })(req, res, next);
});
router.get('/logout', function (req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/index');
});
router.get('/profile', auth.isAuthenticated, function (req, res, next) {
  res.render('../views/users/profile');
})
/* router.get('/admin', auth.isAuthenticatedadmin, function (req, res, next) {
  res.render('../views/partias/index',{layout: 'administrador' });
}) */
router.get('/admin', auth.isAuthenticatedadmin, function (req, res, next) {
  //res.render('../views/Componentes/Productos_Panel', { layout: 'administrador' });
  res.render('../Portal/index', { layout: 'admin' });
})

router.post('/pro', function (req, res, next) {
  var nameuser = req.session.passport.user.name
  var emailuser = req.session.passport.user.email
  var roleuser = req.session.passport.user.role
  var iduser = req.session.passport.user._id
  var datoJson = { "name": nameuser, "email": emailuser, "role": roleuser, "id": iduser }
  res.json({ datoJson });
})

router.post('/getchat', async function (req, res, next) {
  var id_chat = req.body.id_chat
  var chate = await chat_mensaje.find({ id_chat: id_chat }, async function (err, mensaje) {
    return res.render('../views/admin/chatadmin', { layout: false, mensaje })
  })
})
router.post('/GetProductos', async function (req, res, next) {
  const productos = await productodb.find();
  res.render('../views/Componentes/Productos_datos', { layout: false, productos });
})

router.post('/GetProductoOne', async function (req, res) {
  var id_producto = req.body.value
  var productos = await productodb.findById({ _id: id_producto })
  res.render('../views/Componentes/PopUp_productos', { layout: false, productos });
})

router.post('/PutCarrito', auth.isAuthenticatedadmin, async function (req, res) {
  var id_producto = req.body.value
  var id_usere = req.session.passport.user._id
  if (id_producto != null) {
    var NewCart = await new CartModel({ id_user: id_usere, id_producto: id_producto })
    NewCart.save()
    await CartModel.find({ id_user: id_usere }, await function (err, car) {
      productodb.populate(car, { path: 'id_producto' }, function (err, carr, indice) {
        var valortotal = 0;
        carr.forEach(function (carritoUno) {
          valortotal += Number(carritoUno.id_producto.PrecioPro)
        });
        return res.render('../views/Componentes/Carrito_Menu', { layout: false, carr, valortotal })
      })
    })
  } else {
    await CartModel.find({ id_user: id_usere }, await function (err, car) {
      productodb.populate(car, { path: 'id_producto' }, function (err, carr, indice) {
        var valortotal = 0;
        carr.forEach(function (carritoUno) {
          valortotal += Number(carritoUno.id_producto.PrecioPro)
        });
        return res.render('../views/Componentes/Carrito_Menu', { layout: false, carr, valortotal })
      })
    })
  }
})

router.post('/DeleteCarrito', function (req, res) {
  var id_producto = req.body.value
  var id_usere = req.session.passport.user._id
  CartModel.deleteOne({ _id: id_producto }, function (err, ok) {
    if (ok) {
      CartModel.find({ id_user: id_usere }, function (err, car) {
        productodb.populate(car, { path: 'id_producto' }, function (err, carr, indice) {

          return res.render('../views/Componentes/Carrito_Menu', { layout: false, carr })
        })
      })
    }
  })
})
router.post('/DeleteCarroDetalle', function (req, res) {
  var id_producto = req.body.value
  var id_usere = req.session.passport.user._id
  CartModel.deleteOne({ _id: id_producto }, function (err, ok) {
    if (ok) {
      CartModel.find({ id_user: id_usere }, function (err, car) {
        productodb.populate(car, { path: 'id_producto' }, function (err, carr, indice) {
          var valortotal = 0;
          carr.forEach(function (carritoUno) {
            valortotal += Number(carritoUno.id_producto.PrecioPro)
          });
          return res.render('../views/Componentes/Detalles_carrito', { layout: false, carr, valortotal });
        })
      })
    }
  })
})

router.get('/index/contactanos', auth.isAuthenticatedadmin, function (req, res, next) {
  res.render('../views/Componentes/Contactanos', { layout: 'admin' });
})
router.get('/index/somos', auth.isAuthenticatedadmin, function (req, res, next) {
  res.render('../views/Componentes/QuienesSomos', { layout: 'admin' });
})
router.get('/index/preguntas', auth.isAuthenticatedadmin, function (req, res, next) {
  res.render('../views/Componentes/FQS', { layout: 'admin' });
})


router.get('/index/getSingle/:id', function (req, res) {
  var ide = req.params.id
  tallas_producto.find({ id_producto: ide }, function (err, talle) {
    productodb.findOne({ _id: ide }, function (err, prod) {
      res.render('../views/Componentes/Producto_single', { layout: 'admin', prod, talle });
    });
  });
})

router.get('/index/gestion', auth.isAuthenticatedadmin, function (req, res, next) {
  return res.render('../views/Componentes/Add_productos', { layout: 'Admin' });
})

router.get('/index/Elementos', function (req, res, next) {
  return res.render('../views/Componentes/Elementos', { layout: 'Admin' });
})

var fs = require('fs');
var formidable = require('formidable');
router.post('/Agregar_producto', async function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    obj = JSON.parse(fields.ched);
    var NombrePro = fields.Nombre
    var PrecioPro = fields.precio
    var Tipo = fields.Tipo
    var Categoria = fields.Categoria
    var Marca = fields.Marca
    var DescripcionPro = fields.Descripcion
    var ImgPro = File.imagen.name
    var NewProducto = new productodb({
      NombrePro: NombrePro, DescripcionPro: DescripcionPro,
      PrecioPro: PrecioPro, Tipo: Tipo, Categoria: Categoria, Marca: Marca, ImgPro: ImgPro
    });
    NewProducto.save()
      .then(function (productonuevo) {
        var id_producto = productonuevo._id
        obj.forEach(function (e) {
          var NewTallas = new tallas_producto({ id_producto: id_producto, talla: e.talla, Cantidad: e.cantidad })
          NewTallas.save();
        })
      })
    var oldPath = File.imagen.path
    var newPath = 'src/public/images/Productos_img/' + File.imagen.name
    fs.createReadStream(oldPath).pipe(fs.createWriteStream(newPath));
  })
})





router.get('/index/productos/:page', async function (req, res, next) {

  let perPage = 3
  let page = req.params.page || 1
  var categorias = await new_categoria.find({})
  var marca = await new_marca.find({})
  var tipo = await new_tipo.find({})
  var paginad = []
  await productodb.find({}).skip((perPage * page) - perPage).limit(perPage).exec((err, productos) => {
    productodb.estimatedDocumentCount((err, count) => {
      if (err) {
        console.log(err)
      }
      var count_new = Math.ceil(count / perPage)
      for (var i = 1; i < count_new + 1; i++) {
        paginad.push(i)
      }
      res.render('../views/Componentes/TodosProductos', {
        layout: 'Admin',
        productos,
        current: page,
        paginad,
        categorias,
        marca,
        tipo
      })
      /*
       var pages = (Math.ceil(count / perPage))
       var current = page
       console.log(pages)
       console.log(current) */
    })
  })

})

router.post('/Filtrar_productos',  async function (req, res, next) {
  //console.log()
  /*  var value = req.body.dato
   await productodb.find({ Tipo: value }, (error, productos) => {
     return res.render('../views/Componentes/Productos_Filtros', { layout: false, productos });
   })
  */
  var tipo = JSON.parse(req.body.datos_tipoo)
  var marca = JSON.parse(req.body.datos_marcaa)
  /*  var categoria = JSON.parse(req.body.datos_catee) */
  /*  console.log(tipo)
   console.log(marca) */
   var pes = []
  for await (var doc of productodb.find({})) {
    var pos = doc.find({Tipo:'MUJER'})
    pes.push(pos)
  }
  console.log(pes)
  /* var cursor = productodb.find({}).cursor();
  cursor.on('data', function (doc) {
    console.log(doc)
  });
  cursor.on('close', function() {
    console.log("close")
  }); */
  /* productodb.find({ filter:{Tipo:tipo}  }, function(err, pro){
    console.log(pro)
    console.log(err)
  })   */

  /* console.log(categoria) */
  /* if (typeof tipo != "undefined" && tipo != null && tipo.length != null && tipo.length > 0) {
    tipo.forEach(async (val) => {
      productodb.find()
    })
  } */

  /* if (product_filtrado != null) {
    console.log("hay")
  } else {
    console.log("no hay")
  } */


  //

})



/*const new_categoria = require('../models/Categoria_model')
const new_tipo = require('../models/tipo_model')
const new_marca = require('../models/Marca_model')*/
/* router.post('/GetFiltros', auth.isAuthenticatedadmin, async function (req, res, next) {

  return res.render('../views/Componentes/Filtros_panel.hbs', { layout: false, categorias, marca, tipo });

}) */


/*  */
//https://tradmart-demo.myshopify.com/collections/all?
//http://demo.devitems.com/asbab/index.html


module.exports = router;

/*
var nombre = File.imagen.name.substring(0,File.imagen.name.lastIndexOf("."));
var extension = path.extname(File.imagen.name)
var newstr = nombre.replace(nombre, "ImagenOla" + extension);  */