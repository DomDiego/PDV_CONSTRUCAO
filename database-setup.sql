-- Scripts SQL para Criação das Tabelas no Supabase
-- Execute estes comandos no SQL Editor do seu projeto Supabase

-- Tabela para armazenar os clientes
-- Cadastro simples, como solicitado.
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para armazenar os produtos do estoque
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE, -- SKU: Stock Keeping Unit (Código de Barras/Referência)
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para registrar as vendas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Se o cliente for deletado, a venda não é perdida
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- Ex: Dinheiro, Cartão de Crédito, PIX
  sale_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de junção para registrar os itens de cada venda
-- Uma venda pode ter vários produtos.
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE, -- Se a venda for deletada, os itens dela também são.
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL -- Preço do produto no momento da venda
);

-- Habilitar Row Level Security (RLS) para segurança (importante!)
-- Isso garante que apenas usuários autenticados possam acessar os dados.
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (exemplo: permitir que usuários logados façam tudo)
CREATE POLICY "Allow authenticated users full access" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON sales FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON sale_items FOR ALL TO authenticated USING (true);
