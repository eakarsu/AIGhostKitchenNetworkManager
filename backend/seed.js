require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS profitability CASCADE;
      DROP TABLE IF EXISTS waste_records CASCADE;
      DROP TABLE IF EXISTS cleaning_schedules CASCADE;
      DROP TABLE IF EXISTS equipment CASCADE;
      DROP TABLE IF EXISTS loyalty_programs CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS delivery_zones CASCADE;
      DROP TABLE IF EXISTS revenue_records CASCADE;
      DROP TABLE IF EXISTS platform_fees CASCADE;
      DROP TABLE IF EXISTS health_inspections CASCADE;
      DROP TABLE IF EXISTS temperature_logs CASCADE;
      DROP TABLE IF EXISTS quality_checklists CASCADE;
      DROP TABLE IF EXISTS food_costs CASCADE;
      DROP TABLE IF EXISTS labor_schedules CASCADE;
      DROP TABLE IF EXISTS kitchen_schedules CASCADE;
      DROP TABLE IF EXISTS drivers CASCADE;
      DROP TABLE IF EXISTS packaging CASCADE;
      DROP TABLE IF EXISTS recipes CASCADE;
      DROP TABLE IF EXISTS inventory CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS kitchen_stations CASCADE;
      DROP TABLE IF EXISTS menu_items CASCADE;
      DROP TABLE IF EXISTS brands CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('All tables dropped.');

    // ===================== CREATE TABLES =====================
    console.log('Creating tables...');

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR UNIQUE,
        password VARCHAR,
        name VARCHAR,
        role VARCHAR DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        concept VARCHAR,
        cuisine_type VARCHAR,
        description TEXT,
        logo_url VARCHAR,
        status VARCHAR DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE menu_items (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        name VARCHAR NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        category VARCHAR,
        is_available BOOLEAN DEFAULT true,
        prep_time_minutes INT,
        calories INT,
        image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE kitchen_stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        station_type VARCHAR,
        capacity INT,
        status VARCHAR DEFAULT 'active',
        assigned_brands TEXT,
        equipment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR UNIQUE,
        brand_id INT REFERENCES brands(id),
        platform VARCHAR,
        customer_name VARCHAR,
        items TEXT,
        total DECIMAL(10,2),
        status VARCHAR DEFAULT 'pending',
        station_id INT REFERENCES kitchen_stations(id),
        delivery_address TEXT,
        driver_id INT,
        prep_time_minutes INT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        category VARCHAR,
        quantity DECIMAL(10,2),
        unit VARCHAR,
        min_threshold DECIMAL(10,2),
        cost_per_unit DECIMAL(10,2),
        supplier VARCHAR,
        shared_across_brands BOOLEAN DEFAULT true,
        last_restocked TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE recipes (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        name VARCHAR NOT NULL,
        description TEXT,
        ingredients TEXT,
        instructions TEXT,
        prep_time_minutes INT,
        cook_time_minutes INT,
        servings INT,
        cost_per_serving DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE packaging (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        name VARCHAR NOT NULL,
        type VARCHAR,
        cost DECIMAL(10,2),
        stock_quantity INT,
        supplier VARCHAR,
        eco_friendly BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE drivers (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        phone VARCHAR,
        vehicle_type VARCHAR,
        license_plate VARCHAR,
        status VARCHAR DEFAULT 'available',
        current_location VARCHAR,
        rating DECIMAL(3,2),
        total_deliveries INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE kitchen_schedules (
        id SERIAL PRIMARY KEY,
        station_id INT REFERENCES kitchen_stations(id),
        brand_id INT REFERENCES brands(id),
        day_of_week VARCHAR,
        start_time TIME,
        end_time TIME,
        staff_count INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE labor_schedules (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR NOT NULL,
        role VARCHAR,
        station_id INT REFERENCES kitchen_stations(id),
        shift_date DATE,
        start_time TIME,
        end_time TIME,
        hourly_rate DECIMAL(10,2),
        status VARCHAR DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE food_costs (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        menu_item_id INT REFERENCES menu_items(id),
        ingredient_cost DECIMAL(10,2),
        packaging_cost DECIMAL(10,2),
        labor_cost DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        selling_price DECIMAL(10,2),
        profit_margin DECIMAL(5,2),
        period VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE quality_checklists (
        id SERIAL PRIMARY KEY,
        station_id INT REFERENCES kitchen_stations(id),
        checklist_type VARCHAR,
        items TEXT,
        completed_by VARCHAR,
        score INT,
        notes TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE temperature_logs (
        id SERIAL PRIMARY KEY,
        station_id INT REFERENCES kitchen_stations(id),
        equipment_name VARCHAR,
        temperature DECIMAL(5,2),
        unit VARCHAR DEFAULT 'F',
        status VARCHAR,
        recorded_by VARCHAR,
        notes TEXT,
        recorded_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE health_inspections (
        id SERIAL PRIMARY KEY,
        inspection_date DATE,
        inspector_name VARCHAR,
        score INT,
        max_score INT,
        status VARCHAR,
        findings TEXT,
        corrective_actions TEXT,
        next_inspection DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE platform_fees (
        id SERIAL PRIMARY KEY,
        platform VARCHAR NOT NULL,
        brand_id INT REFERENCES brands(id),
        fee_type VARCHAR,
        percentage DECIMAL(5,2),
        flat_fee DECIMAL(10,2),
        period VARCHAR,
        total_orders INT,
        total_fees DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE revenue_records (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        platform VARCHAR,
        date DATE,
        orders_count INT,
        gross_revenue DECIMAL(10,2),
        platform_fees DECIMAL(10,2),
        net_revenue DECIMAL(10,2),
        avg_order_value DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE delivery_zones (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        zone_code VARCHAR,
        radius_miles DECIMAL(5,2),
        base_delivery_fee DECIMAL(10,2),
        estimated_time_minutes INT,
        active_drivers INT,
        status VARCHAR DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR,
        phone VARCHAR,
        address TEXT,
        total_orders INT DEFAULT 0,
        total_spent DECIMAL(10,2) DEFAULT 0,
        favorite_brand VARCHAR,
        preferred_platform VARCHAR,
        joined_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE loyalty_programs (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        brand_id INT REFERENCES brands(id),
        points INT DEFAULT 0,
        tier VARCHAR DEFAULT 'bronze',
        total_earned INT DEFAULT 0,
        total_redeemed INT DEFAULT 0,
        last_activity DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE equipment (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        station_id INT REFERENCES kitchen_stations(id),
        type VARCHAR,
        brand VARCHAR,
        model VARCHAR,
        purchase_date DATE,
        last_maintenance DATE,
        next_maintenance DATE,
        status VARCHAR DEFAULT 'operational',
        warranty_until DATE,
        cost DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE cleaning_schedules (
        id SERIAL PRIMARY KEY,
        area VARCHAR NOT NULL,
        task VARCHAR NOT NULL,
        frequency VARCHAR,
        assigned_to VARCHAR,
        last_completed TIMESTAMP,
        next_due TIMESTAMP,
        status VARCHAR DEFAULT 'pending',
        checklist TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE waste_records (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        item_name VARCHAR NOT NULL,
        category VARCHAR,
        quantity DECIMAL(10,2),
        unit VARCHAR,
        reason VARCHAR,
        cost_impact DECIMAL(10,2),
        recorded_by VARCHAR,
        waste_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE profitability (
        id SERIAL PRIMARY KEY,
        brand_id INT REFERENCES brands(id),
        kitchen_location VARCHAR,
        period VARCHAR,
        revenue DECIMAL(10,2),
        food_cost DECIMAL(10,2),
        labor_cost DECIMAL(10,2),
        packaging_cost DECIMAL(10,2),
        platform_fees DECIMAL(10,2),
        overhead DECIMAL(10,2),
        net_profit DECIMAL(10,2),
        profit_margin DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('All tables created.');

    // ===================== SEED DATA =====================
    console.log('Seeding data...');

    // --- Users ---
    const hashedPassword = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role) VALUES
      ($1, $2, 'Admin User', 'admin')
    `, ['admin@ghostkitchen.com', hashedPassword]);
    console.log('Users seeded.');

    // --- Brands ---
    await client.query(`
      INSERT INTO brands (name, concept, cuisine_type, description, logo_url, status) VALUES
      ('Dragon Wok Express', 'Fast-casual Chinese takeout', 'Chinese', 'Authentic wok-fired dishes with a modern twist, specializing in stir-fries, noodles, and dim sum.', '/logos/dragon-wok.png', 'active'),
      ('Bella Napoli Pizza', 'Neapolitan-style artisan pizza', 'Italian', 'Wood-fired inspired pizzas with imported Italian ingredients and homemade dough aged 48 hours.', '/logos/bella-napoli.png', 'active'),
      ('Taco Loco Fiesta', 'Authentic Mexican street food', 'Mexican', 'Hand-pressed tortillas, slow-cooked meats, and vibrant salsas inspired by Mexico City street vendors.', '/logos/taco-loco.png', 'active'),
      ('Burger Republic', 'Gourmet smash burgers', 'American', 'Premium Angus beef smash burgers with artisanal buns and creative topping combinations.', '/logos/burger-republic.png', 'active'),
      ('Sakura Sushi House', 'Contemporary Japanese cuisine', 'Japanese', 'Fresh sushi rolls, sashimi platters, and Japanese comfort food using sustainably sourced fish.', '/logos/sakura-sushi.png', 'active'),
      ('Mumbai Street Kitchen', 'Indian street food and curries', 'Indian', 'Aromatic curries, tandoori specialties, and beloved Indian street snacks like chaat and samosas.', '/logos/mumbai-street.png', 'active'),
      ('Mediterranean Bliss', 'Healthy Mediterranean bowls', 'Mediterranean', 'Fresh grain bowls, wraps, and platters featuring olive oil, herbs, grilled proteins, and hummus.', '/logos/med-bliss.png', 'active'),
      ('Seoul Kitchen BBQ', 'Korean BBQ and comfort food', 'Korean', 'Marinated BBQ meats, bibimbap bowls, Korean fried chicken, and traditional banchan sides.', '/logos/seoul-kitchen.png', 'active'),
      ('Le Petit Bistro', 'French comfort cuisine', 'French', 'Classic French dishes reimagined for delivery: coq au vin, croque monsieur, and fresh crepes.', '/logos/le-petit.png', 'active'),
      ('Smoke & Grill House', 'Low and slow BBQ', 'BBQ', '12-hour smoked brisket, pulled pork, and ribs with house-made sauces and classic sides.', '/logos/smoke-grill.png', 'active'),
      ('The Poke Bowl Co', 'Hawaiian-inspired poke bowls', 'Hawaiian', 'Build-your-own poke bowls with sushi-grade tuna, salmon, and tropical toppings.', '/logos/poke-bowl.png', 'active'),
      ('Bangkok Street Food', 'Authentic Thai cuisine', 'Thai', 'Pad Thai, green curry, tom yum soup, and mango sticky rice crafted by Thai-trained chefs.', '/logos/bangkok-street.png', 'active'),
      ('Falafel Kingdom', 'Middle Eastern classics', 'Middle Eastern', 'Crispy falafel, creamy hummus, shawarma wraps, and mezze platters with fresh-baked pita.', '/logos/falafel-kingdom.png', 'active'),
      ('Caribbean Flame', 'Caribbean island flavors', 'Caribbean', 'Jerk chicken, oxtail stew, plantains, and tropical rice dishes bursting with island spices.', '/logos/caribbean-flame.png', 'active'),
      ('Green Garden Vegan', '100% plant-based cuisine', 'Vegan', 'Creative plant-based meals including impossible burgers, cauliflower tacos, and acai bowls.', '/logos/green-garden.png', 'active')
    `);
    console.log('Brands seeded.');

    // --- Menu Items (15+ items) ---
    await client.query(`
      INSERT INTO menu_items (brand_id, name, description, price, category, is_available, prep_time_minutes, calories, image_url) VALUES
      (1, 'Kung Pao Chicken', 'Wok-tossed chicken with peanuts, dried chilies, and Sichuan peppercorns', 14.99, 'Entree', true, 12, 680, '/images/kung-pao.jpg'),
      (1, 'Beef Lo Mein', 'Stir-fried egg noodles with tender beef strips and vegetables', 13.99, 'Entree', true, 10, 720, '/images/lo-mein.jpg'),
      (1, 'Pork Dumplings (8pc)', 'Hand-folded dumplings with seasoned pork and ginger', 9.99, 'Appetizer', true, 15, 440, '/images/dumplings.jpg'),
      (2, 'Margherita Pizza', 'San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil', 16.99, 'Pizza', true, 18, 850, '/images/margherita.jpg'),
      (2, 'Pepperoni Diavola', 'Spicy pepperoni, calabrian chili, mozzarella, and honey drizzle', 18.99, 'Pizza', true, 18, 980, '/images/diavola.jpg'),
      (3, 'Al Pastor Tacos (3pc)', 'Spit-roasted pork with pineapple, cilantro, and onion on corn tortillas', 11.99, 'Tacos', true, 8, 520, '/images/al-pastor.jpg'),
      (3, 'Carne Asada Burrito', 'Grilled steak, rice, beans, guacamole, and pico de gallo in a flour tortilla', 14.99, 'Burritos', true, 10, 890, '/images/carne-asada.jpg'),
      (4, 'Classic Smash Burger', 'Double smashed Angus patties, American cheese, pickles, onion, and special sauce', 13.99, 'Burgers', true, 8, 820, '/images/smash-burger.jpg'),
      (4, 'Truffle Mushroom Burger', 'Angus patty, truffle aioli, sauteed mushrooms, Swiss cheese, arugula', 16.99, 'Burgers', true, 10, 910, '/images/truffle-burger.jpg'),
      (5, 'Rainbow Roll (8pc)', 'California roll topped with assorted sashimi and avocado', 17.99, 'Sushi Rolls', true, 15, 420, '/images/rainbow-roll.jpg'),
      (5, 'Spicy Tuna Roll (8pc)', 'Fresh tuna, spicy mayo, cucumber, and sesame seeds', 14.99, 'Sushi Rolls', true, 12, 380, '/images/spicy-tuna.jpg'),
      (6, 'Butter Chicken', 'Tender chicken in creamy tomato-butter sauce with kasuri methi', 15.99, 'Curry', true, 15, 650, '/images/butter-chicken.jpg'),
      (6, 'Lamb Biryani', 'Basmati rice layered with slow-cooked lamb, saffron, and aromatic spices', 18.99, 'Rice', true, 20, 780, '/images/biryani.jpg'),
      (7, 'Chicken Shawarma Bowl', 'Marinated chicken, hummus, tabbouleh, pickled turnip, and garlic sauce over rice', 14.99, 'Bowls', true, 10, 620, '/images/shawarma-bowl.jpg'),
      (7, 'Falafel Wrap', 'Crispy falafel, tahini, fresh veggies, and pickles in warm pita', 12.99, 'Wraps', true, 8, 540, '/images/falafel-wrap.jpg'),
      (8, 'Korean Fried Chicken (8pc)', 'Double-fried chicken glazed with gochujang or soy garlic sauce', 15.99, 'Chicken', true, 18, 760, '/images/kfc-korean.jpg'),
      (8, 'Beef Bulgogi Bowl', 'Marinated beef bulgogi over rice with kimchi and pickled radish', 16.99, 'Bowls', true, 12, 690, '/images/bulgogi.jpg'),
      (9, 'Croque Monsieur', 'Gruyere and ham on brioche with bechamel sauce', 13.99, 'Sandwiches', true, 10, 580, '/images/croque.jpg'),
      (9, 'French Onion Soup', 'Caramelized onion broth with toasted baguette and melted Gruyere', 10.99, 'Soups', true, 8, 380, '/images/onion-soup.jpg'),
      (10, 'Smoked Brisket Plate', '12-hour oak-smoked beef brisket with coleslaw and cornbread', 19.99, 'Plates', true, 5, 920, '/images/brisket.jpg'),
      (10, 'Pulled Pork Sandwich', 'Slow-smoked pulled pork with tangy vinegar slaw on brioche', 14.99, 'Sandwiches', true, 5, 750, '/images/pulled-pork.jpg'),
      (11, 'Ahi Tuna Poke Bowl', 'Sushi-grade ahi tuna, rice, edamame, mango, and ponzu sauce', 16.99, 'Bowls', true, 8, 480, '/images/ahi-poke.jpg'),
      (12, 'Pad Thai', 'Rice noodles with shrimp, tofu, peanuts, bean sprouts, and tamarind sauce', 14.99, 'Noodles', true, 12, 620, '/images/pad-thai.jpg'),
      (12, 'Green Curry', 'Coconut green curry with bamboo shoots, Thai basil, and jasmine rice', 15.99, 'Curry', true, 15, 580, '/images/green-curry.jpg'),
      (13, 'Falafel Platter', 'Six crispy falafel with hummus, baba ganoush, tabbouleh, and pita', 14.99, 'Platters', true, 10, 620, '/images/falafel-platter.jpg'),
      (14, 'Jerk Chicken Plate', 'Scotch bonnet marinated chicken with rice and peas and fried plantains', 16.99, 'Plates', true, 15, 780, '/images/jerk-chicken.jpg'),
      (14, 'Oxtail Stew', 'Slow-braised oxtail in rich gravy with butter beans and steamed rice', 21.99, 'Stews', true, 10, 850, '/images/oxtail.jpg'),
      (15, 'Impossible Smash Burger', 'Double Impossible patties, vegan cheese, lettuce, tomato, and plant-based aioli', 15.99, 'Burgers', true, 10, 680, '/images/impossible-burger.jpg'),
      (15, 'Acai Power Bowl', 'Blended acai with granola, banana, strawberries, and almond butter', 13.99, 'Bowls', true, 5, 420, '/images/acai-bowl.jpg')
    `);
    console.log('Menu items seeded.');

    // --- Kitchen Stations ---
    await client.query(`
      INSERT INTO kitchen_stations (name, station_type, capacity, status, assigned_brands, equipment) VALUES
      ('Wok Station Alpha', 'wok', 4, 'active', 'Dragon Wok Express, Bangkok Street Food', 'Commercial wok range, wok burners x4, prep counter'),
      ('Pizza Oven Bay', 'oven', 3, 'active', 'Bella Napoli Pizza', 'Deck pizza oven, dough mixer, proofing cabinet'),
      ('Grill Line 1', 'grill', 5, 'active', 'Burger Republic, Smoke & Grill House', 'Flat-top griddle, charbroiler, salamander, fryer'),
      ('Taco Assembly', 'assembly', 4, 'active', 'Taco Loco Fiesta, Falafel Kingdom', 'Tortilla press, steam table, plancha grill'),
      ('Sushi Prep Station', 'cold', 3, 'active', 'Sakura Sushi House, The Poke Bowl Co', 'Sushi case, rice cooker, fish refrigerator'),
      ('Curry Kitchen', 'stove', 4, 'active', 'Mumbai Street Kitchen, Bangkok Street Food', 'Tandoori oven, 6-burner range, spice grinder'),
      ('Mediterranean Prep', 'assembly', 3, 'active', 'Mediterranean Bliss, Falafel Kingdom', 'Gyro rotisserie, falafel fryer, hummus blender'),
      ('Korean BBQ Station', 'grill', 3, 'active', 'Seoul Kitchen BBQ', 'Korean BBQ grill, rice cooker, kimchi fridge'),
      ('French Kitchen', 'stove', 3, 'active', 'Le Petit Bistro', 'French top range, immersion circulator, crepe maker'),
      ('Smoker Bay', 'smoker', 2, 'active', 'Smoke & Grill House, Caribbean Flame', 'Offset smoker, holding cabinet, wood chip storage'),
      ('Bowl Assembly Line', 'assembly', 5, 'active', 'The Poke Bowl Co, Green Garden Vegan, Mediterranean Bliss', 'Cold table, rice warmers, topping station'),
      ('Fryer Station', 'fryer', 4, 'active', 'Burger Republic, Seoul Kitchen BBQ, Falafel Kingdom', 'Double deep fryers, oil filtration system, warming rack'),
      ('Dessert & Beverage', 'cold', 2, 'active', 'Le Petit Bistro, Green Garden Vegan', 'Blast chiller, blender station, pastry case'),
      ('Prep Kitchen Central', 'prep', 6, 'active', 'All Brands', 'Food processor, vacuum sealer, slicers, prep tables'),
      ('Packaging & Dispatch', 'dispatch', 8, 'active', 'All Brands', 'Heat sealers, label printers, order screens, shelving')
    `);
    console.log('Kitchen stations seeded.');

    // --- Orders ---
    await client.query(`
      INSERT INTO orders (order_number, brand_id, platform, customer_name, items, total, status, station_id, delivery_address, driver_id, prep_time_minutes) VALUES
      ('ORD-20260301-001', 1, 'UberEats', 'James Wilson', 'Kung Pao Chicken x1, Pork Dumplings x1', 24.98, 'delivered', 1, '142 Oak Street, Apt 3B, Downtown', 1, 12),
      ('ORD-20260301-002', 2, 'DoorDash', 'Sarah Chen', 'Margherita Pizza x1, Pepperoni Diavola x1', 35.98, 'delivered', 2, '88 Pine Avenue, Suite 201', 2, 18),
      ('ORD-20260301-003', 4, 'GrubHub', 'Mike Thompson', 'Classic Smash Burger x2, Truffle Mushroom Burger x1', 44.97, 'preparing', 3, '567 Elm Drive, Building C', 3, 10),
      ('ORD-20260301-004', 3, 'UberEats', 'Emily Rodriguez', 'Al Pastor Tacos x2, Carne Asada Burrito x1', 38.97, 'ready', 4, '23 Maple Lane', 4, 10),
      ('ORD-20260301-005', 5, 'DoorDash', 'David Kim', 'Rainbow Roll x2, Spicy Tuna Roll x1', 50.97, 'delivered', 5, '901 Cherry Blvd, Unit 7', 5, 15),
      ('ORD-20260301-006', 6, 'UberEats', 'Priya Patel', 'Butter Chicken x1, Lamb Biryani x1', 34.98, 'in_transit', 6, '445 Birch Road', 6, 20),
      ('ORD-20260301-007', 8, 'GrubHub', 'Jennifer Lee', 'Korean Fried Chicken x1, Beef Bulgogi Bowl x1', 32.98, 'preparing', 8, '78 Walnut Street, Apt 12A', 7, 15),
      ('ORD-20260301-008', 10, 'DoorDash', 'Robert Brown', 'Smoked Brisket Plate x2', 39.98, 'delivered', 10, '234 Spruce Court', 8, 5),
      ('ORD-20260301-009', 12, 'UberEats', 'Lisa Nguyen', 'Pad Thai x1, Green Curry x1', 30.98, 'pending', 6, '567 Aspen Way, Suite 4', 9, 15),
      ('ORD-20260301-010', 14, 'DoorDash', 'Marcus Johnson', 'Jerk Chicken Plate x1, Oxtail Stew x1', 38.98, 'preparing', 10, '890 Cedar Lane', 10, 15),
      ('ORD-20260301-011', 15, 'GrubHub', 'Amanda Foster', 'Impossible Smash Burger x1, Acai Power Bowl x1', 29.98, 'ready', 11, '123 Redwood Ave', 11, 10),
      ('ORD-20260301-012', 7, 'UberEats', 'Chris Martinez', 'Chicken Shawarma Bowl x2', 29.98, 'delivered', 7, '456 Sequoia Blvd, Apt 5', 12, 10),
      ('ORD-20260301-013', 9, 'DoorDash', 'Sophie Williams', 'Croque Monsieur x1, French Onion Soup x1', 24.98, 'in_transit', 9, '789 Magnolia Drive', 13, 10),
      ('ORD-20260301-014', 11, 'GrubHub', 'Tyler Adams', 'Ahi Tuna Poke Bowl x2', 33.98, 'pending', 5, '321 Cypress Street', 14, 8),
      ('ORD-20260301-015', 13, 'UberEats', 'Rachel Green', 'Falafel Platter x2', 29.98, 'delivered', 7, '654 Palm Court, Unit 9', 15, 10),
      ('ORD-20260301-016', 1, 'DoorDash', 'Kevin Park', 'Beef Lo Mein x2, Pork Dumplings x2', 47.96, 'preparing', 1, '987 Juniper Way', 1, 12),
      ('ORD-20260301-017', 4, 'UberEats', 'Olivia Taylor', 'Classic Smash Burger x1', 13.99, 'delivered', 3, '159 Willow Lane, Apt 8', 3, 8)
    `);
    console.log('Orders seeded.');

    // --- Inventory ---
    await client.query(`
      INSERT INTO inventory (name, category, quantity, unit, min_threshold, cost_per_unit, supplier, shared_across_brands, last_restocked) VALUES
      ('Jasmine Rice', 'Grains', 200, 'lbs', 50, 0.89, 'Golden Grain Distributors', true, '2026-03-20 08:00:00'),
      ('Chicken Breast', 'Protein', 150, 'lbs', 40, 3.49, 'Farm Fresh Meats', true, '2026-03-21 06:00:00'),
      ('All-Purpose Flour', 'Grains', 100, 'lbs', 25, 0.55, 'Millers Wholesale', true, '2026-03-19 07:00:00'),
      ('Mozzarella Cheese', 'Dairy', 80, 'lbs', 20, 4.25, 'Artisan Dairy Co', false, '2026-03-21 06:30:00'),
      ('Angus Ground Beef', 'Protein', 120, 'lbs', 30, 5.99, 'Premium Cattle Ranch', false, '2026-03-20 05:00:00'),
      ('Sushi-Grade Tuna', 'Seafood', 40, 'lbs', 15, 18.99, 'Pacific Seafood Direct', false, '2026-03-22 05:00:00'),
      ('Avocados', 'Produce', 200, 'units', 50, 1.25, 'Valley Farms Produce', true, '2026-03-21 07:00:00'),
      ('Soy Sauce', 'Condiments', 30, 'gallons', 10, 8.50, 'Asian Imports Co', true, '2026-03-18 09:00:00'),
      ('Olive Oil (Extra Virgin)', 'Oils', 25, 'gallons', 8, 22.00, 'Mediterranean Imports', true, '2026-03-17 10:00:00'),
      ('Corn Tortillas', 'Bread', 500, 'units', 100, 0.12, 'La Tortilleria', false, '2026-03-22 06:00:00'),
      ('Gochujang Paste', 'Condiments', 15, 'lbs', 5, 6.75, 'Korean Pantry Wholesale', false, '2026-03-19 08:00:00'),
      ('Basmati Rice', 'Grains', 100, 'lbs', 25, 1.49, 'Spice Route Trading', false, '2026-03-20 07:00:00'),
      ('Heavy Cream', 'Dairy', 40, 'quarts', 10, 3.99, 'Artisan Dairy Co', true, '2026-03-21 06:00:00'),
      ('Hickory Wood Chips', 'Supplies', 60, 'lbs', 20, 2.25, 'Smokehouse Suppliers', false, '2026-03-18 11:00:00'),
      ('Chickpeas (dried)', 'Legumes', 80, 'lbs', 20, 1.35, 'Middle East Foods Inc', true, '2026-03-19 09:00:00'),
      ('Scotch Bonnet Peppers', 'Produce', 30, 'lbs', 10, 4.50, 'Caribbean Specialty Foods', false, '2026-03-20 06:00:00'),
      ('Nori Sheets', 'Dry Goods', 500, 'sheets', 100, 0.18, 'Pacific Seafood Direct', false, '2026-03-21 05:00:00'),
      ('Fresh Basil', 'Herbs', 20, 'lbs', 5, 8.00, 'Valley Farms Produce', true, '2026-03-22 07:00:00')
    `);
    console.log('Inventory seeded.');

    // --- Recipes ---
    await client.query(`
      INSERT INTO recipes (brand_id, name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes, servings, cost_per_serving) VALUES
      (1, 'Kung Pao Chicken', 'Classic Sichuan stir-fry with numbing heat', 'Chicken thigh 8oz, Dried red chilies 10pc, Roasted peanuts 2oz, Sichuan peppercorns 1tsp, Soy sauce 2tbsp, Rice vinegar 1tbsp, Cornstarch 1tbsp, Garlic 3 cloves, Ginger 1inch, Scallions 3pc', 'Marinate diced chicken in soy sauce and cornstarch 15 min. Heat wok until smoking, stir-fry chicken until golden. Add chilies and peppercorns, flash-fry 30 sec. Add garlic and ginger, toss. Deglaze with vinegar, add peanuts, finish with scallions.', 15, 8, 2, 3.45),
      (2, 'Margherita Pizza', 'Traditional Neapolitan pizza with 48-hour fermented dough', '00 Flour 250g, San Marzano tomatoes 100g, Fresh mozzarella 125g, Fresh basil 6 leaves, Extra virgin olive oil 1tbsp, Sea salt 5g, Yeast 1g, Water 165ml', 'Mix flour, water, salt, and yeast. Knead 10 min, cold ferment 48 hours. Stretch dough by hand. Spread crushed tomatoes, tear mozzarella over top. Bake at 800F for 90 seconds. Finish with basil and olive oil.', 10, 2, 1, 2.80),
      (3, 'Al Pastor Tacos', 'Spit-style roasted pork with pineapple', 'Pork shoulder 1lb, Dried guajillo chilies 4pc, Achiote paste 2tbsp, Pineapple 4 slices, White onion 1pc, Cilantro 1 bunch, Lime 2pc, Corn tortillas 6pc, Garlic 4 cloves, Orange juice 1/4 cup', 'Toast and rehydrate guajillo chilies. Blend with achiote, garlic, and orange juice. Marinate thinly sliced pork 4 hours. Layer pork and pineapple on vertical spit, roast until caramelized. Slice thinly, serve on warm tortillas with onion, cilantro, and lime.', 30, 120, 3, 2.15),
      (4, 'Classic Smash Burger', 'Crispy-edged double smash patty', 'Angus ground beef 6oz, American cheese 2 slices, Brioche bun 1pc, Dill pickles 4 slices, White onion 2 slices, Special sauce 2tbsp, Butter 1tbsp, Salt, Black pepper', 'Divide beef into two 3oz balls. Smash on screaming hot griddle with heavy press. Season with salt and pepper. Flip after 2 min, add cheese. Toast buttered bun. Assemble: sauce on both buns, patty, pickles, onion, patty, top bun.', 5, 5, 1, 2.90),
      (5, 'Rainbow Roll', 'Inside-out roll with assorted sashimi', 'Sushi rice 1 cup, Nori 1 sheet, Imitation crab 3oz, Avocado 1pc, Cucumber 1/2pc, Tuna sashimi 2 slices, Salmon sashimi 2 slices, Yellowtail 2 slices, Shrimp 2pc, Sesame seeds 1tsp, Rice vinegar 2tbsp', 'Prepare sushi rice with vinegar. Lay nori on bamboo mat, spread rice, flip. Place crab, avocado, cucumber in center, roll tightly. Top with alternating slices of tuna, salmon, yellowtail, and shrimp. Slice into 8 pieces.', 20, 0, 1, 5.20),
      (6, 'Butter Chicken', 'Creamy tomato-based chicken curry', 'Chicken thigh 1lb, Yogurt 1/2 cup, Garam masala 2tsp, Turmeric 1tsp, Kashmiri chili powder 2tsp, Tomato puree 1 cup, Heavy cream 1/2 cup, Butter 3tbsp, Kasuri methi 1tsp, Ginger-garlic paste 2tbsp, Onion 1 large', 'Marinate chicken in yogurt and spices 4 hours. Grill or broil until charred. Sautee onions and ginger-garlic paste in butter. Add tomato puree, simmer 20 min. Add cream, kasuri methi, and grilled chicken. Simmer 10 min, finish with butter.', 20, 35, 4, 2.65),
      (7, 'Chicken Shawarma Bowl', 'Marinated and grilled chicken over rice', 'Chicken thigh 8oz, Shawarma spice mix 2tbsp, Lemon juice 2tbsp, Olive oil 2tbsp, Basmati rice 1 cup, Hummus 3tbsp, Tomato 1pc, Cucumber 1/2pc, Pickled turnip 2tbsp, Garlic sauce 2tbsp, Parsley', 'Marinate chicken in spices, lemon, and oil for 2 hours. Grill on high heat, slice thinly. Cook rice with turmeric. Assemble bowl: rice base, sliced chicken, hummus, diced tomato, cucumber, pickled turnip, drizzle garlic sauce.', 15, 12, 1, 3.10),
      (8, 'Korean Fried Chicken', 'Double-fried chicken with gochujang glaze', 'Chicken wings 2lbs, Potato starch 1 cup, Rice flour 1/2 cup, Gochujang 3tbsp, Soy sauce 2tbsp, Honey 2tbsp, Garlic 4 cloves, Ginger 1tbsp, Sesame oil 1tsp, Sesame seeds, Scallions', 'Coat chicken in potato starch and rice flour mix. Fry at 325F for 10 min, rest 5 min. Fry again at 375F for 5 min until extra crispy. Toss in gochujang-honey-soy glaze. Garnish with sesame seeds and scallions.', 15, 20, 4, 3.35),
      (9, 'Croque Monsieur', 'Classic French grilled ham and cheese', 'Brioche bread 2 slices, Gruyere cheese 3oz, Black forest ham 3oz, Butter 2tbsp, All-purpose flour 1tbsp, Whole milk 1/2 cup, Dijon mustard 1tsp, Nutmeg pinch, Salt, White pepper', 'Make bechamel: melt butter, whisk in flour, slowly add milk, season with nutmeg, salt, pepper. Spread mustard on bread, layer ham and half the Gruyere. Top with second slice, spread bechamel on top, cover with remaining Gruyere. Bake at 400F for 10 min until golden and bubbly.', 10, 12, 1, 3.50),
      (10, 'Smoked Brisket', '12-hour oak-smoked beef brisket', 'Whole packer brisket 12lbs, Coarse black pepper 1/4 cup, Kosher salt 1/4 cup, Garlic powder 2tbsp, Onion powder 2tbsp, Paprika 1tbsp, Oak wood 8lbs, Apple cider vinegar spray, Beef tallow 1/4 cup', 'Trim brisket, leaving 1/4 inch fat cap. Apply rub generously. Smoke at 225F with oak for 6 hours, spritz hourly with vinegar. Wrap in butcher paper with tallow at 165F internal. Continue smoking until 203F internal. Rest 2 hours minimum before slicing.', 30, 720, 15, 4.50),
      (11, 'Ahi Tuna Poke Bowl', 'Hawaiian-style raw tuna bowl', 'Sushi-grade ahi tuna 6oz, Sushi rice 1 cup, Soy sauce 2tbsp, Sesame oil 1tsp, Edamame 1/4 cup, Mango 1/4 cup diced, Cucumber 1/4 cup, Avocado 1/2pc, Seaweed salad 2tbsp, Ponzu 1tbsp, Sesame seeds, Scallions', 'Dice tuna into 3/4 inch cubes. Toss with soy sauce and sesame oil. Prepare sushi rice. Assemble bowl: rice base, marinated tuna, edamame, mango, cucumber, avocado, seaweed salad. Drizzle with ponzu, top with sesame seeds and scallions.', 15, 0, 1, 5.80),
      (12, 'Pad Thai', 'Classic Thai stir-fried rice noodles', 'Rice noodles 8oz, Shrimp 6pc, Tofu 3oz, Egg 1pc, Bean sprouts 1 cup, Tamarind paste 2tbsp, Fish sauce 2tbsp, Palm sugar 1tbsp, Garlic 3 cloves, Roasted peanuts 2tbsp, Lime 1pc, Chili flakes', 'Soak rice noodles in warm water 30 min. Make sauce: tamarind, fish sauce, palm sugar. Stir-fry shrimp and tofu, push aside. Scramble egg. Add noodles and sauce, toss until absorbed. Add bean sprouts, garnish with peanuts, lime, chili flakes.', 15, 8, 2, 2.95),
      (13, 'Falafel Platter', 'Crispy chickpea fritters with mezze', 'Dried chickpeas 2 cups, Fresh parsley 1 cup, Cilantro 1/2 cup, Onion 1pc, Garlic 5 cloves, Cumin 2tsp, Coriander 1tsp, Baking powder 1tsp, Tahini 3tbsp, Lemon juice, Pita bread 2pc, Tomatoes, Cucumber, Pickles', 'Soak chickpeas overnight. Blend with herbs, onion, garlic, and spices until coarse. Form into balls, rest 30 min. Deep fry at 350F for 4 min until golden brown. Serve with hummus, baba ganoush, tabbouleh, tahini sauce, and warm pita.', 25, 5, 2, 2.20),
      (14, 'Jerk Chicken', 'Scotch bonnet marinated grilled chicken', 'Chicken leg quarters 4pc, Scotch bonnet peppers 3pc, Allspice 2tbsp, Thyme 1tbsp, Scallions 4pc, Garlic 6 cloves, Ginger 2tbsp, Soy sauce 2tbsp, Brown sugar 1tbsp, Lime juice 2tbsp, Cinnamon 1/2tsp, Nutmeg 1/4tsp', 'Blend scotch bonnets, allspice, thyme, scallions, garlic, ginger, soy sauce, sugar, lime into paste. Score chicken, marinate 8-24 hours. Grill over pimento wood or charcoal at medium-high, basting with marinade. Cook until internal 175F.', 20, 35, 4, 2.85),
      (15, 'Impossible Smash Burger', 'Plant-based double smash patty', 'Impossible ground 6oz, Vegan American cheese 2 slices, Brioche-style vegan bun 1pc, Dill pickles 4 slices, Caramelized onion 2tbsp, Vegan aioli 2tbsp, Arugula 1/4 cup, Tomato 2 slices, Vegan butter 1tbsp', 'Divide Impossible meat into two 3oz balls. Smash on hot griddle until crispy edges form. Season generously. Flip, add vegan cheese to melt. Toast buttered vegan bun. Build: aioli on buns, arugula, tomato, first patty, caramelized onion, second patty, pickles.', 5, 6, 1, 3.80)
    `);
    console.log('Recipes seeded.');

    // --- Packaging ---
    await client.query(`
      INSERT INTO packaging (brand_id, name, type, cost, stock_quantity, supplier, eco_friendly) VALUES
      (1, 'Chinese Takeout Container (32oz)', 'container', 0.35, 2000, 'EcoPak Solutions', true),
      (2, 'Pizza Box 12-inch', 'box', 0.65, 1500, 'BoxCraft Industries', true),
      (3, 'Foil Burrito Wrap', 'wrap', 0.15, 3000, 'Restaurant Supply Co', false),
      (4, 'Kraft Burger Box', 'box', 0.45, 2500, 'EcoPak Solutions', true),
      (5, 'Sushi Tray with Lid', 'tray', 0.80, 1000, 'Pacific Packaging', true),
      (6, 'Indian Curry Container (16oz)', 'container', 0.30, 2000, 'Restaurant Supply Co', false),
      (7, 'Bowl Container (32oz)', 'bowl', 0.40, 2500, 'EcoPak Solutions', true),
      (8, 'Korean Fried Chicken Box', 'box', 0.50, 1500, 'BoxCraft Industries', true),
      (9, 'French Bistro Paper Bag', 'bag', 0.25, 3000, 'EcoPak Solutions', true),
      (10, 'BBQ Plate Clamshell', 'clamshell', 0.55, 1800, 'Restaurant Supply Co', false),
      (11, 'Poke Bowl Container', 'bowl', 0.45, 2000, 'Pacific Packaging', true),
      (12, 'Thai Noodle Box', 'box', 0.38, 2200, 'EcoPak Solutions', true),
      (13, 'Falafel Wrap Paper', 'wrap', 0.10, 5000, 'Restaurant Supply Co', true),
      (14, 'Caribbean Plate Box', 'box', 0.48, 1600, 'BoxCraft Industries', false),
      (15, 'Compostable Bowl (16oz)', 'bowl', 0.60, 1800, 'EcoPak Solutions', true)
    `);
    console.log('Packaging seeded.');

    // --- Drivers ---
    await client.query(`
      INSERT INTO drivers (name, phone, vehicle_type, license_plate, status, current_location, rating, total_deliveries) VALUES
      ('Carlos Mendez', '555-0101', 'Car', 'ABC-1234', 'available', '142 Oak Street', 4.85, 1247),
      ('Aisha Johnson', '555-0102', 'Car', 'DEF-5678', 'on_delivery', '88 Pine Avenue', 4.92, 2103),
      ('Ryan O''Brien', '555-0103', 'Motorcycle', 'MOT-9012', 'available', '567 Elm Drive', 4.78, 890),
      ('Mei Lin', '555-0104', 'E-Bike', 'EBK-3456', 'on_delivery', '23 Maple Lane', 4.95, 1567),
      ('Diego Ramirez', '555-0105', 'Car', 'GHI-7890', 'available', '901 Cherry Blvd', 4.88, 1834),
      ('Fatima Al-Rashid', '555-0106', 'Car', 'JKL-2345', 'on_delivery', '445 Birch Road', 4.90, 1456),
      ('Tommy Nguyen', '555-0107', 'Motorcycle', 'MOT-6789', 'available', '78 Walnut Street', 4.82, 1023),
      ('Jessica Brown', '555-0108', 'Car', 'MNO-0123', 'off_duty', '234 Spruce Court', 4.75, 678),
      ('Raj Patel', '555-0109', 'E-Bike', 'EBK-4567', 'available', '567 Aspen Way', 4.91, 1345),
      ('Marcus Williams', '555-0110', 'Car', 'PQR-8901', 'on_delivery', '890 Cedar Lane', 4.87, 2056),
      ('Sophie Chen', '555-0111', 'E-Bike', 'EBK-2345', 'available', '123 Redwood Ave', 4.93, 1678),
      ('Andre Jackson', '555-0112', 'Car', 'STU-6789', 'available', '456 Sequoia Blvd', 4.80, 945),
      ('Emma Taylor', '555-0113', 'Car', 'VWX-0123', 'on_delivery', '789 Magnolia Drive', 4.86, 1234),
      ('Hiroshi Tanaka', '555-0114', 'Motorcycle', 'MOT-4567', 'available', '321 Cypress Street', 4.89, 1567),
      ('Liam Foster', '555-0115', 'Car', 'YZA-8901', 'off_duty', '654 Palm Court', 4.77, 789)
    `);
    console.log('Drivers seeded.');

    // --- Kitchen Schedules ---
    await client.query(`
      INSERT INTO kitchen_schedules (station_id, brand_id, day_of_week, start_time, end_time, staff_count, notes) VALUES
      (1, 1, 'Monday', '10:00', '22:00', 3, 'Dragon Wok main shift, prep wok sauces by 10:30'),
      (2, 2, 'Monday', '10:00', '23:00', 2, 'Bella Napoli full service, dough prep starts at 09:00'),
      (3, 4, 'Monday', '11:00', '23:00', 3, 'Burger Republic lunch and dinner rush'),
      (4, 3, 'Monday', '10:00', '22:00', 2, 'Taco Loco salsa and meat prep at 09:30'),
      (5, 5, 'Monday', '11:00', '21:00', 2, 'Sakura Sushi fish delivery at 10:00, prep sushi rice'),
      (6, 6, 'Tuesday', '10:00', '22:00', 3, 'Mumbai Street Kitchen curry base prep at 09:00'),
      (7, 7, 'Tuesday', '10:00', '21:00', 2, 'Mediterranean Bliss hummus and grain prep'),
      (8, 8, 'Tuesday', '11:00', '22:00', 2, 'Seoul Kitchen banchan prep, marinate proteins'),
      (9, 9, 'Wednesday', '10:00', '21:00', 2, 'Le Petit Bistro bechamel and stock prep'),
      (10, 10, 'Wednesday', '06:00', '22:00', 2, 'Smoke & Grill brisket goes on at 06:00 AM'),
      (1, 12, 'Thursday', '10:00', '22:00', 2, 'Bangkok Street Food shares wok station'),
      (11, 11, 'Thursday', '10:00', '21:00', 2, 'Poke Bowl Co fish and topping prep'),
      (7, 13, 'Friday', '10:00', '23:00', 3, 'Falafel Kingdom high-volume Friday service'),
      (10, 14, 'Friday', '08:00', '22:00', 3, 'Caribbean Flame jerk chicken marinade day before'),
      (11, 15, 'Saturday', '09:00', '22:00', 3, 'Green Garden Vegan weekend brunch and dinner')
    `);
    console.log('Kitchen schedules seeded.');

    // --- Labor Schedules ---
    await client.query(`
      INSERT INTO labor_schedules (employee_name, role, station_id, shift_date, start_time, end_time, hourly_rate, status) VALUES
      ('Marco Rossi', 'Head Chef', 2, '2026-03-23', '09:00', '17:00', 28.00, 'scheduled'),
      ('Wei Zhang', 'Wok Chef', 1, '2026-03-23', '10:00', '18:00', 24.00, 'scheduled'),
      ('Alejandra Gomez', 'Line Cook', 4, '2026-03-23', '10:00', '18:00', 18.50, 'scheduled'),
      ('Jake Miller', 'Grill Cook', 3, '2026-03-23', '11:00', '19:00', 19.00, 'scheduled'),
      ('Yuki Tanaka', 'Sushi Chef', 5, '2026-03-23', '10:00', '18:00', 26.00, 'scheduled'),
      ('Priya Sharma', 'Curry Chef', 6, '2026-03-23', '09:00', '17:00', 22.00, 'scheduled'),
      ('Omar Hassan', 'Line Cook', 7, '2026-03-23', '10:00', '18:00', 18.00, 'scheduled'),
      ('Jin Park', 'Korean BBQ Chef', 8, '2026-03-23', '11:00', '19:00', 23.00, 'scheduled'),
      ('Pierre Dubois', 'Sous Chef', 9, '2026-03-23', '09:00', '17:00', 25.00, 'scheduled'),
      ('Billy Thompson', 'Pitmaster', 10, '2026-03-23', '05:00', '15:00', 27.00, 'clocked_in'),
      ('Lani Kahale', 'Prep Cook', 11, '2026-03-23', '09:00', '17:00', 17.50, 'scheduled'),
      ('Nong Srisai', 'Thai Chef', 6, '2026-03-23', '14:00', '22:00', 22.00, 'scheduled'),
      ('Sarah Mitchell', 'Packaging Lead', 15, '2026-03-23', '10:00', '18:00', 16.50, 'scheduled'),
      ('David Chen', 'Prep Cook', 14, '2026-03-23', '07:00', '15:00', 17.00, 'clocked_in'),
      ('Maria Santos', 'Dishwasher', 14, '2026-03-23', '11:00', '19:00', 16.00, 'scheduled'),
      ('Kevin O''Connor', 'Expeditor', 15, '2026-03-23', '11:00', '19:00', 17.50, 'scheduled')
    `);
    console.log('Labor schedules seeded.');

    // --- Food Costs ---
    await client.query(`
      INSERT INTO food_costs (brand_id, menu_item_id, ingredient_cost, packaging_cost, labor_cost, total_cost, selling_price, profit_margin, period) VALUES
      (1, 1, 3.45, 0.35, 2.00, 5.80, 14.99, 61.31, '2026-03'),
      (1, 2, 3.20, 0.35, 1.80, 5.35, 13.99, 61.76, '2026-03'),
      (1, 3, 2.10, 0.35, 2.50, 4.95, 9.99, 50.45, '2026-03'),
      (2, 4, 2.80, 0.65, 2.20, 5.65, 16.99, 66.74, '2026-03'),
      (2, 5, 3.10, 0.65, 2.20, 5.95, 18.99, 68.67, '2026-03'),
      (3, 6, 2.15, 0.15, 1.50, 3.80, 11.99, 68.31, '2026-03'),
      (3, 7, 2.85, 0.15, 1.80, 4.80, 14.99, 67.98, '2026-03'),
      (4, 8, 2.90, 0.45, 1.50, 4.85, 13.99, 65.33, '2026-03'),
      (4, 9, 3.60, 0.45, 1.80, 5.85, 16.99, 65.57, '2026-03'),
      (5, 10, 5.20, 0.80, 3.00, 9.00, 17.99, 49.97, '2026-03'),
      (5, 11, 4.10, 0.80, 2.50, 7.40, 14.99, 50.63, '2026-03'),
      (6, 12, 2.65, 0.30, 2.00, 4.95, 15.99, 69.04, '2026-03'),
      (6, 13, 3.50, 0.30, 2.50, 6.30, 18.99, 66.83, '2026-03'),
      (7, 14, 3.10, 0.40, 1.80, 5.30, 14.99, 64.64, '2026-03'),
      (8, 16, 3.35, 0.50, 2.50, 6.35, 15.99, 60.29, '2026-03')
    `);
    console.log('Food costs seeded.');

    // --- Quality Checklists ---
    await client.query(`
      INSERT INTO quality_checklists (station_id, checklist_type, items, completed_by, score, notes, completed_at) VALUES
      (1, 'Opening', 'Wok seasoning check, Oil levels, Sauce mise en place, Station sanitized, Thermometer calibrated', 'Wei Zhang', 95, 'All items in order, one wok needs re-seasoning tomorrow', '2026-03-23 10:15:00'),
      (2, 'Opening', 'Oven temp verified, Dough proofed, Toppings fresh, Station sanitized, Pizza peel clean', 'Marco Rossi', 100, 'Perfect opening, dough fermented 50 hours today', '2026-03-23 10:00:00'),
      (3, 'Mid-Service', 'Grill temp 450F, Patty weights correct, Bun freshness, Topping levels, Oil change needed', 'Jake Miller', 88, 'Oil needs changing by 6 PM, otherwise all good', '2026-03-23 14:30:00'),
      (4, 'Opening', 'Tortilla press calibrated, Salsa freshness, Meat temp checked, Guac prepared, Station clean', 'Alejandra Gomez', 92, 'Salsa verde slightly thicker than spec, adjusted', '2026-03-23 10:20:00'),
      (5, 'Opening', 'Fish temp 34F verified, Rice at correct vinegar ratio, Nori crisp, Knives sharpened, Gloves stocked', 'Yuki Tanaka', 98, 'All seafood within temp range, excellent quality tuna today', '2026-03-23 11:00:00'),
      (6, 'Mid-Service', 'Curry consistency check, Rice texture, Tandoori temp, Spice levels, Naan quality', 'Priya Sharma', 90, 'Butter chicken sauce slightly thin, added cream to adjust', '2026-03-23 14:00:00'),
      (7, 'Closing', 'Leftover labeling, Temp log complete, Surfaces sanitized, Equipment off, Walk-in organized', 'Omar Hassan', 94, 'All closing procedures followed, walk-in at 38F', '2026-03-22 21:30:00'),
      (8, 'Opening', 'Banchan prepared, Gochujang sauce ready, Grill cleaned, Rice cooker on, Kimchi checked', 'Jin Park', 96, 'Fresh batch of kimchi ready, all banchan prepped', '2026-03-23 11:10:00'),
      (9, 'Opening', 'Bechamel consistency, Stock simmering, Crepe batter rested, Gruyere sliced, Station mise ready', 'Pierre Dubois', 97, 'Stock reduced perfectly, crepe batter rested 4 hours', '2026-03-23 10:05:00'),
      (10, 'Morning', 'Smoker temp 225F stable, Brisket internal temp 165F, Wood chip level, Drip pan emptied, Bark formation check', 'Billy Thompson', 100, 'Brisket wrapped at 165F, excellent bark formation', '2026-03-23 11:00:00'),
      (11, 'Opening', 'Fish freshness verified, Rice warm, Toppings prepped, Bowls stocked, Sauces filled', 'Lani Kahale', 93, 'Need to reorder edamame by end of day', '2026-03-23 10:30:00'),
      (12, 'Mid-Service', 'Fryer oil temp, Chicken coating consistency, Sauce thickness, Plating standards, Portion control', 'Jin Park', 91, 'Adjusted fryer temp from 340 to 350 for crispier coating', '2026-03-23 15:00:00'),
      (14, 'Opening', 'Prep tables sanitized, Scales calibrated, Knives sharpened, Cutting boards color-coded, FIFO labels current', 'David Chen', 95, 'All labels current, FIFO rotation excellent', '2026-03-23 07:30:00'),
      (15, 'Mid-Service', 'Label printer working, Order accuracy check, Packaging seal integrity, Temp of outgoing orders, Dispatch speed', 'Sarah Mitchell', 89, 'Average dispatch time 2.3 min, target is 2 min', '2026-03-23 13:00:00'),
      (3, 'Closing', 'Grill scraped, Grease trap emptied, Surfaces sanitized, Food stored and labeled, Floor mopped', 'Jake Miller', 92, 'Grease trap needs deep clean this weekend', '2026-03-22 23:15:00')
    `);
    console.log('Quality checklists seeded.');

    // --- Temperature Logs ---
    await client.query(`
      INSERT INTO temperature_logs (station_id, equipment_name, temperature, unit, status, recorded_by, notes) VALUES
      (5, 'Fish Refrigerator', 33.5, 'F', 'normal', 'Yuki Tanaka', 'Sushi-grade fish stored properly'),
      (5, 'Sushi Display Case', 38.0, 'F', 'normal', 'Yuki Tanaka', 'Display case maintaining temp'),
      (1, 'Wok Range Surface', 650.0, 'F', 'normal', 'Wei Zhang', 'Optimal wok hei temperature'),
      (2, 'Pizza Oven', 785.0, 'F', 'normal', 'Marco Rossi', 'Oven preheated and stable'),
      (3, 'Flat-Top Griddle', 425.0, 'F', 'normal', 'Jake Miller', 'Griddle at smash burger temp'),
      (6, 'Tandoori Oven', 550.0, 'F', 'normal', 'Priya Sharma', 'Tandoor fully heated'),
      (10, 'Offset Smoker', 227.0, 'F', 'normal', 'Billy Thompson', 'Smoker holding steady at 225-230'),
      (14, 'Walk-In Cooler', 37.5, 'F', 'normal', 'David Chen', 'Walk-in temp within range'),
      (14, 'Walk-In Freezer', -5.0, 'F', 'normal', 'David Chen', 'Freezer functioning properly'),
      (12, 'Deep Fryer 1', 350.0, 'F', 'normal', 'Jin Park', 'Oil temp correct for Korean fried chicken'),
      (12, 'Deep Fryer 2', 348.0, 'F', 'normal', 'Jin Park', 'Slightly below target, adjusting'),
      (6, 'Curry Steam Table', 155.0, 'F', 'normal', 'Priya Sharma', 'Holding temp above 140F minimum'),
      (8, 'Korean BBQ Grill', 475.0, 'F', 'normal', 'Jin Park', 'Grill at optimal bulgogi temp'),
      (13, 'Dessert Cooler', 36.0, 'F', 'normal', 'Pierre Dubois', 'Pastries stored at correct temp'),
      (3, 'Burger Holding Warmer', 148.0, 'F', 'warning', 'Jake Miller', 'Slightly below 150F target, investigating'),
      (4, 'Meat Prep Fridge', 35.0, 'F', 'normal', 'Alejandra Gomez', 'Al pastor meat stored properly')
    `);
    console.log('Temperature logs seeded.');

    // --- Health Inspections ---
    await client.query(`
      INSERT INTO health_inspections (inspection_date, inspector_name, score, max_score, status, findings, corrective_actions, next_inspection) VALUES
      ('2026-01-15', 'Dr. Rebecca Torres', 96, 100, 'passed', 'Minor: One handwash station soap dispenser low. All food temps compliant.', 'Soap dispenser refilled immediately. Added to daily checklist.', '2026-07-15'),
      ('2025-07-20', 'Michael Chang', 98, 100, 'passed', 'Excellent conditions. One floor tile slightly cracked near Station 3.', 'Floor tile repair scheduled for next maintenance window.', '2026-01-20'),
      ('2025-01-10', 'Dr. Rebecca Torres', 94, 100, 'passed', 'Two items: Freezer door gasket worn, one cutting board had minor scoring.', 'Gasket replaced same day. Cutting board replaced.', '2025-07-10'),
      ('2024-07-22', 'Patricia Williams', 91, 100, 'passed', 'Date labels missing on 3 prep containers. One thermometer out of calibration.', 'All items labeled immediately. Thermometer replaced and staff retrained on labeling protocol.', '2025-01-22'),
      ('2026-03-01', 'James Rodriguez', 97, 100, 'passed', 'Outstanding facility. Minor: grease buildup on exhaust hood filter above Station 3.', 'Deep cleaning of hood scheduled for March 5. Increased hood cleaning frequency.', '2026-09-01'),
      ('2025-09-15', 'Dr. Sarah Kim', 93, 100, 'passed', 'Walk-in cooler at 39F (slightly above 38F target). Chemical storage properly separated.', 'Walk-in thermostat adjusted. Monitoring increased to every 2 hours.', '2026-03-15'),
      ('2024-12-05', 'Robert Anderson', 95, 100, 'passed', 'Good overall. Employee changing area slightly disorganized.', 'Installed additional lockers and posted organization guidelines.', '2025-06-05'),
      ('2025-03-20', 'Maria Gonzalez', 99, 100, 'passed', 'Near-perfect score. Only note: one sanitizer test strip expired.', 'Test strips replaced. Added monthly expiration check to supply audit.', '2025-09-20'),
      ('2024-06-18', 'Dr. Rebecca Torres', 88, 100, 'passed', 'Multiple findings: two staff without hair nets, pest control log gap, drain grate loose.', 'Hair net policy reinforced, pest control logs updated, drain repaired within 48 hours.', '2024-12-18'),
      ('2025-12-10', 'Michael Chang', 96, 100, 'passed', 'Very good. Ice machine needs descaling. All food handling practices excellent.', 'Ice machine descaling scheduled and completed December 12.', '2026-06-10'),
      ('2026-02-14', 'Patricia Williams', 95, 100, 'passed', 'Solid inspection. One station had cleaning solution stored above food prep area.', 'Chemical moved to designated storage. Staff meeting held on chemical storage policy.', '2026-08-14'),
      ('2025-05-22', 'James Rodriguez', 97, 100, 'passed', 'Excellent hygiene practices observed. Minor scuff marks on walls near delivery entrance.', 'Walls repainted during next scheduled maintenance.', '2025-11-22'),
      ('2024-09-30', 'Dr. Sarah Kim', 92, 100, 'passed', 'Adequate ventilation confirmed. Some labels handwritten and hard to read.', 'Invested in label printer for all stations. Standardized label format implemented.', '2025-03-30'),
      ('2025-06-15', 'Robert Anderson', 98, 100, 'passed', 'Outstanding cleanliness. All certifications current. One fire extinguisher near expiry.', 'Fire extinguisher replaced immediately. Added to monthly safety checklist.', '2025-12-15'),
      ('2024-03-08', 'Maria Gonzalez', 90, 100, 'passed', 'Several items: Floor drains need cleaning, one reach-in cooler slightly warm at 42F, missing allergen chart at Station 7.', 'Drain cleaning schedule created, cooler repaired, allergen charts posted at all stations.', '2024-09-08')
    `);
    console.log('Health inspections seeded.');

    // --- Platform Fees ---
    await client.query(`
      INSERT INTO platform_fees (platform, brand_id, fee_type, percentage, flat_fee, period, total_orders, total_fees) VALUES
      ('UberEats', 1, 'commission', 30.00, 0.00, '2026-03', 342, 3078.00),
      ('DoorDash', 1, 'commission', 25.00, 0.00, '2026-03', 289, 2167.50),
      ('GrubHub', 1, 'commission', 20.00, 0.00, '2026-03', 156, 936.00),
      ('UberEats', 2, 'commission', 30.00, 0.00, '2026-03', 412, 4944.00),
      ('DoorDash', 2, 'commission', 25.00, 0.00, '2026-03', 378, 3780.00),
      ('UberEats', 4, 'commission', 30.00, 0.00, '2026-03', 523, 4707.00),
      ('DoorDash', 4, 'commission', 25.00, 0.00, '2026-03', 445, 3337.50),
      ('UberEats', 5, 'commission', 30.00, 0.00, '2026-03', 198, 2376.00),
      ('DoorDash', 5, 'commission', 25.00, 0.00, '2026-03', 167, 1670.00),
      ('UberEats', 6, 'commission', 30.00, 0.00, '2026-03', 278, 2780.00),
      ('GrubHub', 8, 'commission', 20.00, 0.00, '2026-03', 201, 1206.00),
      ('DoorDash', 10, 'commission', 25.00, 0.00, '2026-03', 312, 2808.00),
      ('UberEats', 12, 'commission', 30.00, 0.00, '2026-03', 245, 2205.00),
      ('DoorDash', 14, 'commission', 25.00, 0.00, '2026-03', 189, 1417.50),
      ('GrubHub', 15, 'commission', 20.00, 0.00, '2026-03', 167, 834.00)
    `);
    console.log('Platform fees seeded.');

    // --- Revenue Records ---
    await client.query(`
      INSERT INTO revenue_records (brand_id, platform, date, orders_count, gross_revenue, platform_fees, net_revenue, avg_order_value) VALUES
      (1, 'UberEats', '2026-03-22', 18, 432.00, 129.60, 302.40, 24.00),
      (1, 'DoorDash', '2026-03-22', 15, 345.00, 86.25, 258.75, 23.00),
      (2, 'UberEats', '2026-03-22', 22, 528.00, 158.40, 369.60, 24.00),
      (2, 'DoorDash', '2026-03-22', 19, 437.00, 109.25, 327.75, 23.00),
      (3, 'UberEats', '2026-03-22', 25, 375.00, 112.50, 262.50, 15.00),
      (4, 'UberEats', '2026-03-22', 28, 504.00, 151.20, 352.80, 18.00),
      (4, 'DoorDash', '2026-03-22', 24, 408.00, 102.00, 306.00, 17.00),
      (5, 'DoorDash', '2026-03-22', 12, 264.00, 66.00, 198.00, 22.00),
      (6, 'UberEats', '2026-03-22', 16, 368.00, 110.40, 257.60, 23.00),
      (8, 'GrubHub', '2026-03-22', 14, 294.00, 58.80, 235.20, 21.00),
      (10, 'DoorDash', '2026-03-22', 17, 357.00, 89.25, 267.75, 21.00),
      (11, 'UberEats', '2026-03-22', 13, 247.00, 74.10, 172.90, 19.00),
      (12, 'UberEats', '2026-03-22', 15, 300.00, 90.00, 210.00, 20.00),
      (14, 'DoorDash', '2026-03-22', 11, 242.00, 60.50, 181.50, 22.00),
      (15, 'GrubHub', '2026-03-22', 10, 180.00, 36.00, 144.00, 18.00)
    `);
    console.log('Revenue records seeded.');

    // --- Delivery Zones ---
    await client.query(`
      INSERT INTO delivery_zones (name, zone_code, radius_miles, base_delivery_fee, estimated_time_minutes, active_drivers, status) VALUES
      ('Downtown Core', 'DT-01', 1.50, 2.99, 15, 5, 'active'),
      ('Midtown East', 'MT-E02', 2.50, 3.99, 20, 3, 'active'),
      ('Midtown West', 'MT-W03', 2.50, 3.99, 22, 3, 'active'),
      ('Uptown North', 'UT-N04', 4.00, 5.99, 30, 2, 'active'),
      ('Uptown South', 'UT-S05', 3.50, 4.99, 28, 2, 'active'),
      ('East Village', 'EV-06', 2.00, 3.49, 18, 4, 'active'),
      ('West End', 'WE-07', 3.00, 4.49, 25, 2, 'active'),
      ('Harbor District', 'HD-08', 3.50, 4.99, 27, 2, 'active'),
      ('University Quarter', 'UQ-09', 2.00, 2.99, 18, 4, 'active'),
      ('Tech Park', 'TP-10', 5.00, 6.99, 35, 1, 'active'),
      ('Riverside', 'RS-11', 4.50, 5.99, 32, 2, 'active'),
      ('Old Town', 'OT-12', 1.00, 1.99, 12, 3, 'active'),
      ('Airport Area', 'AA-13', 8.00, 9.99, 45, 1, 'active'),
      ('Suburban North', 'SN-14', 6.00, 7.99, 40, 1, 'inactive'),
      ('Industrial Park', 'IP-15', 5.50, 6.49, 35, 1, 'active')
    `);
    console.log('Delivery zones seeded.');

    // --- Customers ---
    await client.query(`
      INSERT INTO customers (name, email, phone, address, total_orders, total_spent, favorite_brand, preferred_platform, joined_date) VALUES
      ('James Wilson', 'james.wilson@email.com', '555-1001', '142 Oak Street, Apt 3B, Downtown', 47, 892.50, 'Dragon Wok Express', 'UberEats', '2025-03-15'),
      ('Sarah Chen', 'sarah.chen@email.com', '555-1002', '88 Pine Avenue, Suite 201', 63, 1456.80, 'Bella Napoli Pizza', 'DoorDash', '2024-11-20'),
      ('Mike Thompson', 'mike.t@email.com', '555-1003', '567 Elm Drive, Building C', 38, 684.20, 'Burger Republic', 'GrubHub', '2025-06-01'),
      ('Emily Rodriguez', 'emily.r@email.com', '555-1004', '23 Maple Lane', 52, 728.00, 'Taco Loco Fiesta', 'UberEats', '2025-01-10'),
      ('David Kim', 'david.kim@email.com', '555-1005', '901 Cherry Blvd, Unit 7', 29, 638.50, 'Sakura Sushi House', 'DoorDash', '2025-05-22'),
      ('Priya Patel', 'priya.p@email.com', '555-1006', '445 Birch Road', 41, 779.00, 'Mumbai Street Kitchen', 'UberEats', '2025-02-14'),
      ('Jennifer Lee', 'jen.lee@email.com', '555-1007', '78 Walnut Street, Apt 12A', 35, 665.50, 'Seoul Kitchen BBQ', 'GrubHub', '2025-04-08'),
      ('Robert Brown', 'rob.brown@email.com', '555-1008', '234 Spruce Court', 56, 1120.00, 'Smoke & Grill House', 'DoorDash', '2024-09-30'),
      ('Lisa Nguyen', 'lisa.n@email.com', '555-1009', '567 Aspen Way, Suite 4', 33, 594.00, 'Bangkok Street Food', 'UberEats', '2025-07-15'),
      ('Marcus Johnson', 'marcus.j@email.com', '555-1010', '890 Cedar Lane', 27, 567.00, 'Caribbean Flame', 'DoorDash', '2025-08-20'),
      ('Amanda Foster', 'amanda.f@email.com', '555-1011', '123 Redwood Ave', 44, 616.00, 'Green Garden Vegan', 'GrubHub', '2025-01-05'),
      ('Chris Martinez', 'chris.m@email.com', '555-1012', '456 Sequoia Blvd, Apt 5', 31, 527.00, 'Mediterranean Bliss', 'UberEats', '2025-06-18'),
      ('Sophie Williams', 'sophie.w@email.com', '555-1013', '789 Magnolia Drive', 22, 462.00, 'Le Petit Bistro', 'DoorDash', '2025-09-01'),
      ('Tyler Adams', 'tyler.a@email.com', '555-1014', '321 Cypress Street', 39, 741.00, 'The Poke Bowl Co', 'GrubHub', '2025-03-28'),
      ('Rachel Green', 'rachel.g@email.com', '555-1015', '654 Palm Court, Unit 9', 48, 816.00, 'Falafel Kingdom', 'UberEats', '2024-12-10')
    `);
    console.log('Customers seeded.');

    // --- Loyalty Programs ---
    await client.query(`
      INSERT INTO loyalty_programs (customer_id, brand_id, points, tier, total_earned, total_redeemed, last_activity) VALUES
      (1, 1, 470, 'silver', 890, 420, '2026-03-22'),
      (2, 2, 1230, 'gold', 1850, 620, '2026-03-22'),
      (3, 4, 280, 'bronze', 680, 400, '2026-03-21'),
      (4, 3, 520, 'silver', 950, 430, '2026-03-22'),
      (5, 5, 340, 'silver', 640, 300, '2026-03-20'),
      (6, 6, 610, 'silver', 1100, 490, '2026-03-22'),
      (7, 8, 250, 'bronze', 550, 300, '2026-03-21'),
      (8, 10, 890, 'gold', 1560, 670, '2026-03-22'),
      (9, 12, 180, 'bronze', 440, 260, '2026-03-19'),
      (10, 14, 150, 'bronze', 380, 230, '2026-03-20'),
      (11, 15, 430, 'silver', 760, 330, '2026-03-22'),
      (12, 7, 200, 'bronze', 460, 260, '2026-03-21'),
      (13, 9, 120, 'bronze', 310, 190, '2026-03-18'),
      (14, 11, 380, 'silver', 710, 330, '2026-03-22'),
      (15, 13, 560, 'silver', 980, 420, '2026-03-22')
    `);
    console.log('Loyalty programs seeded.');

    // --- Equipment ---
    await client.query(`
      INSERT INTO equipment (name, station_id, type, brand, model, purchase_date, last_maintenance, next_maintenance, status, warranty_until, cost) VALUES
      ('Commercial Wok Range', 1, 'cooking', 'Imperial', 'IHR-6-GAS', '2024-06-15', '2026-02-20', '2026-05-20', 'operational', '2027-06-15', 8500.00),
      ('Deck Pizza Oven', 2, 'cooking', 'Bakers Pride', 'Y-602', '2024-03-10', '2026-03-01', '2026-06-01', 'operational', '2027-03-10', 12000.00),
      ('Flat-Top Griddle 48"', 3, 'cooking', 'Star Manufacturing', 'Ultra-Max 848', '2024-08-20', '2026-02-15', '2026-05-15', 'operational', '2027-08-20', 4200.00),
      ('Charbroiler 36"', 3, 'cooking', 'Vulcan', 'VCCB36', '2024-08-20', '2026-01-10', '2026-04-10', 'operational', '2027-08-20', 3800.00),
      ('Tandoori Oven', 6, 'cooking', 'Shahi', 'Clay Tandoor 34"', '2024-05-01', '2026-02-28', '2026-05-28', 'operational', '2027-05-01', 5500.00),
      ('Offset Smoker', 10, 'cooking', 'Lang BBQ', '84 Deluxe', '2024-04-12', '2026-03-10', '2026-06-10', 'operational', '2027-04-12', 9800.00),
      ('Sushi Display Case', 5, 'refrigeration', 'Hoshizaki', 'HNC-180BA', '2024-07-01', '2026-03-05', '2026-06-05', 'operational', '2027-07-01', 6200.00),
      ('Walk-In Cooler', 14, 'refrigeration', 'Kolpak', 'P7-0810-CT', '2023-12-01', '2026-03-15', '2026-06-15', 'operational', '2028-12-01', 15000.00),
      ('Walk-In Freezer', 14, 'refrigeration', 'Kolpak', 'P7-0610-FS', '2023-12-01', '2026-03-15', '2026-06-15', 'operational', '2028-12-01', 18000.00),
      ('Double Deep Fryer', 12, 'cooking', 'Pitco', 'SSH55T', '2024-09-15', '2026-02-25', '2026-05-25', 'operational', '2027-09-15', 7500.00),
      ('Rice Cooker 50-cup', 1, 'cooking', 'Zojirushi', 'NCC-50S', '2025-01-10', '2026-01-10', '2026-07-10', 'operational', '2028-01-10', 890.00),
      ('Food Processor', 14, 'prep', 'Robot Coupe', 'R2N', '2025-02-01', '2026-02-01', '2026-08-01', 'operational', '2028-02-01', 2100.00),
      ('Dough Mixer 30-qt', 2, 'prep', 'Hobart', 'HL300', '2024-03-10', '2026-03-10', '2026-06-10', 'operational', '2027-03-10', 5400.00),
      ('Blast Chiller', 13, 'refrigeration', 'Irinox', 'MF 30.1', '2024-11-01', '2026-01-15', '2026-07-15', 'operational', '2027-11-01', 11000.00),
      ('Label Printer', 15, 'dispatch', 'Brother', 'QL-1110NWB', '2025-06-01', '2026-03-01', '2026-09-01', 'operational', '2028-06-01', 350.00)
    `);
    console.log('Equipment seeded.');

    // --- Cleaning Schedules ---
    await client.query(`
      INSERT INTO cleaning_schedules (area, task, frequency, assigned_to, last_completed, next_due, status, checklist) VALUES
      ('Wok Station Alpha', 'Deep clean wok burners and ventilation hood', 'weekly', 'Wei Zhang', '2026-03-20 22:00:00', '2026-03-27 22:00:00', 'completed', 'Degrease burners, scrub hood filters, wipe surfaces, sanitize handles'),
      ('Pizza Oven Bay', 'Clean oven interior, sweep ash, sanitize prep area', 'daily', 'Marco Rossi', '2026-03-22 23:00:00', '2026-03-23 23:00:00', 'pending', 'Brush oven floor, remove ash, wipe counters, sanitize cutting boards'),
      ('Grill Line 1', 'Scrape griddle, clean grease traps, sanitize surfaces', 'daily', 'Jake Miller', '2026-03-22 23:30:00', '2026-03-23 23:30:00', 'pending', 'Scrape griddle flat, empty grease trap, degrease surfaces, sanitize'),
      ('Sushi Prep Station', 'Sanitize cutting boards, clean display case, organize fridge', 'daily', 'Yuki Tanaka', '2026-03-22 21:00:00', '2026-03-23 21:00:00', 'pending', 'Bleach cutting boards, clean glass case, organize fish by date, wipe all surfaces'),
      ('Curry Kitchen', 'Clean tandoori oven, degrease range, sanitize prep area', 'daily', 'Priya Sharma', '2026-03-22 22:00:00', '2026-03-23 22:00:00', 'pending', 'Cool and brush tandoor, degrease burners, clean spice area, sanitize prep surfaces'),
      ('Walk-In Cooler', 'Full clean, check temps, organize shelves, check FIFO', 'weekly', 'David Chen', '2026-03-17 07:00:00', '2026-03-24 07:00:00', 'pending', 'Remove all items, sanitize shelves, mop floor, check all dates, reorganize by FIFO'),
      ('Walk-In Freezer', 'Defrost check, organize, clean floor, verify seals', 'weekly', 'David Chen', '2026-03-17 08:00:00', '2026-03-24 08:00:00', 'pending', 'Check for ice buildup, organize items, sweep floor, inspect door gasket'),
      ('Fryer Station', 'Filter oil, clean fryer baskets, degrease surrounding area', 'daily', 'Jin Park', '2026-03-22 22:30:00', '2026-03-23 22:30:00', 'pending', 'Filter oil through cone filter, scrub baskets, degrease backsplash and floor'),
      ('Packaging & Dispatch', 'Sanitize counters, clean label printer, organize supplies', 'daily', 'Sarah Mitchell', '2026-03-22 20:00:00', '2026-03-23 20:00:00', 'pending', 'Wipe all counters, clean printer heads, restock bags and containers, sweep floor'),
      ('Restrooms', 'Full sanitization, restock supplies, mop floors', 'twice_daily', 'Maria Santos', '2026-03-23 11:00:00', '2026-03-23 17:00:00', 'pending', 'Sanitize all fixtures, restock soap and towels, mop and disinfect floor, clean mirrors'),
      ('Dish Pit', 'Clean dishwasher, sanitize sinks, organize drying racks', 'daily', 'Maria Santos', '2026-03-22 23:00:00', '2026-03-23 23:00:00', 'pending', 'Run cleaning cycle, scrub sinks, sanitize drain, organize clean racks'),
      ('Dry Storage', 'Organize shelves, check dates, sweep and mop, pest check', 'weekly', 'David Chen', '2026-03-16 15:00:00', '2026-03-23 15:00:00', 'overdue', 'Check all product dates, organize by category, sweep and mop, inspect for pests'),
      ('Floor - Kitchen', 'Full floor cleaning, degrease mats, mop tile', 'daily', 'Night Crew', '2026-03-22 23:30:00', '2026-03-23 23:30:00', 'pending', 'Sweep all areas, degrease rubber mats, mop tile floors, clean drains'),
      ('Smoker Bay', 'Clean smoker interior, empty ash, oil grates, clean area', 'after_use', 'Billy Thompson', '2026-03-22 16:00:00', '2026-03-23 16:00:00', 'pending', 'Remove ash, scrub grates, oil grates, wipe exterior, sweep surrounding area'),
      ('Korean BBQ Station', 'Clean grill plates, degrease ventilation, sanitize prep area', 'daily', 'Jin Park', '2026-03-22 22:00:00', '2026-03-23 22:00:00', 'pending', 'Scrub grill plates, clean vent hood, wipe down all surfaces, sanitize cutting boards')
    `);
    console.log('Cleaning schedules seeded.');

    // --- Waste Records ---
    await client.query(`
      INSERT INTO waste_records (brand_id, item_name, category, quantity, unit, reason, cost_impact, recorded_by, waste_date) VALUES
      (1, 'Wok-fried noodles', 'prepared_food', 3.5, 'lbs', 'Overproduction during slow lunch', 8.75, 'Wei Zhang', '2026-03-22'),
      (2, 'Pizza dough balls', 'prep', 5.0, 'units', 'Over-proofed due to temperature spike', 4.50, 'Marco Rossi', '2026-03-22'),
      (4, 'Angus beef patties', 'protein', 2.0, 'lbs', 'Freezer burn from improper wrapping', 11.98, 'Jake Miller', '2026-03-22'),
      (5, 'Sushi-grade salmon', 'seafood', 1.5, 'lbs', 'Passed 48-hour freshness window', 22.50, 'Yuki Tanaka', '2026-03-22'),
      (6, 'Basmati rice', 'grains', 4.0, 'lbs', 'Overcooked batch, mushy texture', 5.96, 'Priya Sharma', '2026-03-21'),
      (3, 'Corn tortillas', 'bread', 24.0, 'units', 'Stale from improper storage overnight', 2.88, 'Alejandra Gomez', '2026-03-22'),
      (8, 'Kimchi', 'fermented', 2.0, 'lbs', 'Over-fermented past optimal flavor', 3.20, 'Jin Park', '2026-03-21'),
      (10, 'Brisket trimmings', 'protein', 3.0, 'lbs', 'Excessive fat cap trimming', 8.97, 'Billy Thompson', '2026-03-22'),
      (12, 'Fresh basil (Thai)', 'herbs', 0.5, 'lbs', 'Wilted from cooler malfunction', 4.00, 'Nong Srisai', '2026-03-21'),
      (7, 'Hummus', 'prepared_food', 2.0, 'lbs', 'Passed 3-day shelf life', 3.40, 'Omar Hassan', '2026-03-22'),
      (9, 'Bechamel sauce', 'sauce', 1.5, 'quarts', 'Broke during reheating', 5.25, 'Pierre Dubois', '2026-03-22'),
      (14, 'Plantains', 'produce', 3.0, 'lbs', 'Over-ripened past usable stage', 4.50, 'Line Cook', '2026-03-21'),
      (15, 'Mixed salad greens', 'produce', 2.5, 'lbs', 'Wilted, end of shelf life', 6.25, 'Lani Kahale', '2026-03-22'),
      (11, 'Ahi tuna', 'seafood', 0.8, 'lbs', 'Color change, did not pass quality check', 15.19, 'Lani Kahale', '2026-03-22'),
      (13, 'Dried chickpeas (soaked)', 'legumes', 3.0, 'lbs', 'Left soaking too long, fermented', 4.05, 'Omar Hassan', '2026-03-21')
    `);
    console.log('Waste records seeded.');

    // --- Profitability ---
    await client.query(`
      INSERT INTO profitability (brand_id, kitchen_location, period, revenue, food_cost, labor_cost, packaging_cost, platform_fees, overhead, net_profit, profit_margin) VALUES
      (1, 'Main Ghost Kitchen', '2026-03', 15240.00, 4572.00, 3048.00, 533.40, 4572.00, 762.00, 1752.60, 11.50),
      (2, 'Main Ghost Kitchen', '2026-03', 19680.00, 5510.40, 3936.00, 688.80, 5904.00, 984.00, 2656.80, 13.50),
      (3, 'Main Ghost Kitchen', '2026-03', 11400.00, 3192.00, 2280.00, 171.00, 3420.00, 570.00, 1767.00, 15.50),
      (4, 'Main Ghost Kitchen', '2026-03', 22560.00, 6768.00, 4512.00, 1015.20, 6768.00, 1128.00, 2368.80, 10.50),
      (5, 'Main Ghost Kitchen', '2026-03', 12800.00, 5120.00, 3200.00, 640.00, 3840.00, 640.00, -640.00, -5.00),
      (6, 'Main Ghost Kitchen', '2026-03', 14520.00, 3630.00, 2904.00, 435.60, 4356.00, 726.00, 2468.40, 17.00),
      (7, 'Main Ghost Kitchen', '2026-03', 10200.00, 3060.00, 2040.00, 408.00, 3060.00, 510.00, 1122.00, 11.00),
      (8, 'Main Ghost Kitchen', '2026-03', 13440.00, 4032.00, 2688.00, 537.60, 2688.00, 672.00, 2822.40, 21.00),
      (9, 'Main Ghost Kitchen', '2026-03', 8400.00, 2940.00, 2100.00, 210.00, 2520.00, 420.00, 210.00, 2.50),
      (10, 'Main Ghost Kitchen', '2026-03', 16800.00, 5040.00, 3360.00, 672.00, 4200.00, 840.00, 2688.00, 16.00),
      (11, 'Main Ghost Kitchen', '2026-03', 9600.00, 3360.00, 1920.00, 432.00, 2880.00, 480.00, 528.00, 5.50),
      (12, 'Main Ghost Kitchen', '2026-03', 12000.00, 3600.00, 2400.00, 456.00, 3600.00, 600.00, 1344.00, 11.20),
      (13, 'Main Ghost Kitchen', '2026-03', 8880.00, 1776.00, 1776.00, 88.80, 1776.00, 444.00, 3019.20, 34.00),
      (14, 'Main Ghost Kitchen', '2026-03', 10800.00, 3240.00, 2160.00, 518.40, 2700.00, 540.00, 1641.60, 15.20),
      (15, 'Main Ghost Kitchen', '2026-03', 7200.00, 2160.00, 1440.00, 432.00, 1440.00, 360.00, 1368.00, 19.00)
    `);
    console.log('Profitability seeded.');

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('Admin login: admin@ghostkitchen.com / password123');
    console.log('========================================\n');
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

seed();
