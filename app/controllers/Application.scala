package controllers

import scala.concurrent._

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.Play.current
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import Concurrent._

import play.api.libs.concurrent.Execution.Implicits._


case class Vec3(x: Float, y: Float, z: Float)
object Vec3 extends ((Float, Float, Float) => Vec3) {
  implicit val writes = Json.writes[Vec3]
}

case class Vec2(x: Float, y: Float)
object Vec2 extends ((Float, Float) => Vec2) {
  implicit val writes = Json.writes[Vec2]
}


object Application extends Controller {
  val CUBE_INDEXES = Seq(0, 1, 2, 0, 2, 3)

  implicit def Tuple3Writes[A: Writes, B: Writes, C: Writes] = Writes[(A, B, C)]{ o =>
    Json.arr(o._1, o._2, o._3)
  }

  val near = new {
    val positions = Seq( 
      Vec3(-1.0f, -1.0f, 1.0f), 
      Vec3(1.0f, -1.0f, 1.0f), 
      Vec3(1.0f, 1.0f, 1.0f), 
      Vec3(-1.0f, 1.0f, 1.0f)
    )

    val normals = Seq(Vec3(0.0f, 0.0f, 1.0f))

    val texcoords = Seq(
      Vec2(0.0f, 0.0f), 
      Vec2(1.0f, 0.0f), 
      Vec2(1.0f, 1.0f), 
      Vec2(0.0f, 1.0f)
    )
  }
    
  def addSide(
    x: Float, y: Float, z: Float, size: Float, 
    textureOffsetX: Float, textureOffsetY: Float, 
    textureFacX: Float, textureFacY: Float
  ): (Seq[Float], Seq[Float], Seq[Float]) = {
    val halfSize = size / 2

    CUBE_INDEXES.foldLeft((Seq[Float](), Seq[Float](), Seq[Float]())) { 
      case ((positions, norms, texcoords), idx) =>

        val pos = near.positions(idx)
        val tex = near.texcoords(idx)

        (
          positions ++ Seq( x + (pos.x * halfSize), y + (pos.y * halfSize), z + (pos.z * halfSize) ),
          norms ++ Seq( near.normals(0).x, near.normals(0).y, near.normals(0).z ),
          texcoords ++ Seq( tex.x * textureFacX + textureOffsetX, tex.y * textureFacY + textureOffsetY )
        )

    }

  }

  val (stream, channel) = Concurrent.broadcast[JsValue]

  def buildPoly(i: Int, j: Int) = {
    Json.obj(
      "id" -> s"$i$j",
      "data" -> Json.toJson(addSide(
        i * 10.0f, j * 10.0f, 0.0f,
        10.0f, 
        i / 10f, j / 10f, 0.1f, 0.1f
      ))
    )
    
  }

  def polystream = WebSocket.using[JsValue] { request =>
    // in: handle messages from the user
    val in = /*Enumeratee.collect[JsValue]{ case o:JsObject => o } &>>*/
      Iteratee.foreach[JsValue] { o =>
        Enumerator.unfoldM(0 -> 0) { case ((i,j)) =>        
          
          if(i == 10 && j == 10) Future.successful(None)
          else channel push buildPoly(i,j)
          if(j == 9) play.api.libs.concurrent.Promise.timeout( Some( (i+1 , 0), Json.obj():JsValue ), 100 )
          else play.api.libs.concurrent.Promise.timeout( Some( (i , j+1), Json.obj():JsValue ), 100 )
        } |>> Iteratee.foreach[JsValue]( _ => () )
      }

    /*val out = Enumerator[JsValue](
      Json.toJson(addSide(
        0f, 0f, 0f, 1.0f,
        0.0f, 0.0f, 1.0f, 1.0f
      ))
    ) >>> Enumerator.eof*/
    
    (in, stream)
  }

  def index = Action { implicit request =>
    // val obj = Json.obj( 
    //   "block" -> Json.obj(
    //     "pos" -> Seq[String](),
    //     "tpos" -> Seq[String](),
    //     "tfac" -> Seq[String]()
    //   )
    // )
    // val side = addSide(
    //   0f, 0f, 0f, 1.0f,
    //   0.0f, 0.0f, 1.0f, 1.0f
    // )
    //Ok(Json.toJson(side))
    Ok(views.html.index("Your new application is ready."))
  }
  
}