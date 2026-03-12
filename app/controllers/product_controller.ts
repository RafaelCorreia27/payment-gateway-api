import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { createProductValidator } from '#validators/create_product_validator'
import { updateProductValidator } from '#validators/update_product_validator'

/**
 * Controller responsável por gerenciar produtos (CRUD)
 * 
 * Funcionalidades:
 * - Listar produtos
 * - Detalhes de produto
 * - Criar produto
 * - Atualizar produto
 * - Deletar produto
 * 
 * Requer autenticação e roles ADMIN, MANAGER ou FINANCE
 */
export default class ProductController {
  /**
   * Lista todos os produtos
   * GET /products
   * 
   * Retorna lista de produtos com nome e valor
   */
  async index({ response }: HttpContext) {
    try {
      const products = await Product.all()

      return response.ok({
        message: 'Products retrieved successfully',
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          amount: product.amount, // Valor em centavos
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
      })
    } catch (error) {
      console.error('[ProductController] Error in index:', error)
      return response.internalServerError({
        message: 'An error occurred while retrieving products',
      })
    }
  }

  /**
   * Retorna detalhes de um produto específico
   * GET /products/:id
   * 
   * Retorna informações do produto
   */
  async show({ params, response }: HttpContext) {
    try {
      const product = await Product.find(params.id)

      if (!product) {
        return response.notFound({
          message: 'Product not found',
        })
      }

      return response.ok({
        message: 'Product retrieved successfully',
        product: {
          id: product.id,
          name: product.name,
          amount: product.amount, // Valor em centavos
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      })
    } catch (error) {
      console.error('[ProductController] Error in show:', error)
      return response.internalServerError({
        message: 'An error occurred while retrieving product',
      })
    }
  }

  /**
   * Cria um novo produto
   * POST /products
   * 
   * Cria produto com nome e valor (em centavos)
   */
  async store({ request, response }: HttpContext) {
    try {
      // Valida dados de entrada
      const data = await request.validateUsing(createProductValidator)

      // Cria produto
      const product = await Product.create({
        name: data.name,
        amount: data.amount, // Valor em centavos
      })

      return response.created({
        message: 'Product created successfully',
        product: {
          id: product.id,
          name: product.name,
          amount: product.amount,
          createdAt: product.createdAt,
        },
      })
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      console.error('[ProductController] Error in store:', error)
      return response.internalServerError({
        message: 'An error occurred while creating product',
      })
    }
  }

  /**
   * Atualiza um produto existente
   * PUT /products/:id
   * 
   * Atualiza nome e/ou valor
   * Apenas campos enviados são atualizados
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const product = await Product.find(params.id)

      if (!product) {
        return response.notFound({
          message: 'Product not found',
        })
      }

      // Valida dados de entrada
      const data = await request.validateUsing(updateProductValidator)

      // Atualiza apenas os campos enviados
      if (data.name !== undefined) {
        product.name = data.name
      }

      if (data.amount !== undefined) {
        product.amount = data.amount
      }

      await product.save()

      return response.ok({
        message: 'Product updated successfully',
        product: {
          id: product.id,
          name: product.name,
          amount: product.amount,
          updatedAt: product.updatedAt,
        },
      })
    } catch (error) {
      // Se for erro de validação, retorna erro 422
      if (error.messages) {
        return response.unprocessableEntity({
          message: 'Validation failed',
          errors: error.messages,
        })
      }

      console.error('[ProductController] Error in update:', error)
      return response.internalServerError({
        message: 'An error occurred while updating product',
      })
    }
  }

  /**
   * Deleta um produto
   * DELETE /products/:id
   * 
   * Remove produto do banco de dados
   * Nota: Produtos podem estar associados a transações existentes
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const product = await Product.find(params.id)

      if (!product) {
        return response.notFound({
          message: 'Product not found',
        })
      }

      await product.delete()

      return response.ok({
        message: 'Product deleted successfully',
      })
    } catch (error) {
      console.error('[ProductController] Error in destroy:', error)
      return response.internalServerError({
        message: 'An error occurred while deleting product',
      })
    }
  }
}
