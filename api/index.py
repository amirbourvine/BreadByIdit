from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import copy
from datetime import datetime
from flask import send_from_directory
import urllib.parse

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# File to store orders
ORDERS_FILE = 'orders.json'
# New file to store forms data
FORMS_FILE = 'forms.json'
UPLOAD_FOLDER = 'images'

# This section needs to be added to your Flask backend after the app = Flask(__name__) line
# to modify the product template

product_data = {
    "generic_products": []
}


# Make sure UPLOAD_FOLDER exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize orders file if it doesn't exist
if not os.path.exists(ORDERS_FILE):
    with open(ORDERS_FILE, 'w') as f:
        json.dump({}, f)

# Initialize forms file if it doesn't exist
if not os.path.exists(FORMS_FILE):
    with open(FORMS_FILE, 'w') as f:
        # Initialize with the default product data
        json.dump(product_data, f, indent=2)

def read_forms():
    """Read forms from JSON file"""
    if os.path.exists(FORMS_FILE):
        with open(FORMS_FILE, 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                # If file is corrupted, return default data
                return copy.deepcopy(product_data)
    else:
        # If file doesn't exist, create it with default data
        forms_data = copy.deepcopy(product_data)
        with open(FORMS_FILE, 'w') as f:
            json.dump(forms_data, f, indent=2)
        return forms_data

def write_forms(forms_data):
    """Write forms to JSON file"""
    with open(FORMS_FILE, 'w') as f:
        json.dump(forms_data, f, indent=2)

def read_orders():
    """Read orders from JSON file"""
    with open(ORDERS_FILE, 'r') as f:
        return json.load(f)

def write_orders(orders):
    """Write orders to JSON file"""
    with open(ORDERS_FILE, 'w') as f:
        json.dump(orders, f, indent=2)


@app.route('/api/dates', methods=['GET'])
def get_dates():
    """Get available order dates"""
    forms_data = read_forms()
    # Filter out the generic_products key
    dates = [key for key in forms_data.keys() if key != "generic_products"]
    
    return jsonify({
        "success": True,
        "dates": dates
    })


@app.route('/api/forms/<form_name>', methods=['DELETE'])
def delete_form(form_name):
    """Delete a form"""
    forms_data = read_forms()
    
    # Prevent deletion of generic_products
    if form_name == "generic_products":
        return jsonify({
            "success": False,
            "error": "Cannot delete generic products template"
        }), 403
    
    # Check if form exists
    if form_name not in forms_data:
        return jsonify({
            "success": False,
            "error": "Form not found"
        }), 404
    
    # Delete the form
    del forms_data[form_name]
    write_forms(forms_data)

    orders_data = read_orders()
    
    # Check if form exists
    if form_name not in orders_data:
        return jsonify({
            "success": False,
            "error": "Form not found"
        }), 404
    
    # Delete the form
    del orders_data[form_name]
    write_orders(orders_data)
    
    return jsonify({
        "success": True,
        "message": f"Form {form_name} deleted successfully"
    })


@app.route('/api/forms/<form_name>/products', methods=['POST'])
def add_product_to_form(form_name):
    """Add a new product to a specific form"""
    data = request.json
    
    if 'product' not in data:
        return jsonify({
            "success": False,
            "error": "Product data is required"
        }), 400
    
    forms_data = read_forms()
    
    # Check if form exists
    if form_name not in forms_data:
        return jsonify({
            "success": False,
            "error": "Form not found"
        }), 404
    
    # Add existent flag if not present
    new_product = data['product']
    if 'existent' not in new_product:
        new_product['existent'] = True
    
    # Get current products
    if isinstance(forms_data[form_name], dict) and "products" in forms_data[form_name]:
        current_products = forms_data[form_name]["products"]
        metadata = forms_data[form_name].get("metadata", {"visible": True})
    else:
        # Handle old format
        current_products = forms_data[form_name]
        metadata = {"visible": True}
    
    # Add new product to the list
    current_products.append(new_product)
    
    # Update form with new products
    forms_data[form_name] = {
        "products": current_products,
        "metadata": metadata
    }
    
    write_forms(forms_data)
    
    return jsonify({
        "success": True,
        "formName": form_name,
        "productName": new_product["name"]
    })

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Create a new order"""
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'phone', 'date', 'selectedProducts']
    for field in required_fields:
        if field not in data:
            return jsonify({
                "success": False,
                "error": f"Missing required field: {field}"
            }), 400
    
    # Create order object
    form_name = data['date']

    selected_prods = {k: v for k,v in data['selectedProducts'].items() if v["selected"]}
    new_selected_prods = {}
    for prod_name,prod in selected_prods.items():
        new_extras = {k: v for k,v in prod["extras"].items() if v>0}
        new_selected_prods[prod_name] = {"extras": new_extras}

    selected_prods = new_selected_prods


    order = {
        "id": str(datetime.now().timestamp()),
        "name": data['name'],
        "phone": data['phone'],
        "date": data['date'],
        "comment": data.get('comment', ''),
        "selectedProducts": selected_prods,
        "totalAmount": data.get('totalAmount', 0),
        "timestamp": datetime.now().isoformat()
    }
    
    # Read existing orders
    orders = read_orders()
    
    # Add new order
    orders[form_name]["orders"].append(order)
    for prod_name,product in order["selectedProducts"].items():
        if prod_name not in orders[form_name]["products"]:
            orders[form_name]["products"][prod_name] = {"total_amount":0, "extras": {}}
        for extra_name,amount in product["extras"].items():
            if extra_name not in orders[form_name]["products"][prod_name]["extras"]:
                orders[form_name]["products"][prod_name]["extras"][extra_name] = {"amount":0, "names": []}
            
            orders[form_name]["products"][prod_name]["extras"][extra_name]["amount"] += amount
            orders[form_name]["products"][prod_name]["extras"][extra_name]["names"].append(order["name"])
            orders[form_name]["products"][prod_name]["total_amount"] += amount

    # Write updated orders
    write_orders(orders)
    
    return jsonify({
        "success": True,
        "order": order
    })

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get all orders"""
    # print("Here!")
    orders = read_orders()
    
    # Optional date filter
    date_filter = request.args.get('date')
    if date_filter:
        if date_filter in orders:
            orders = orders[date_filter]
        else:
            orders = []
    
    return jsonify({
        "success": True,
        "orders": orders
    })


@app.route('/api/forms_visibility', methods=['PUT'])
def update_forms_visibility():
    """Update visibility of forms"""
    data = request.json
    
    if 'visibility' not in data:
        return jsonify({
            "success": False,
            "error": "Visibility data is required"
        }), 400
    
    visibility_data = data['visibility']
    forms_data = read_forms()
    
    # Create a new field for each form to store visibility if it doesn't exist
    for form_name, is_visible in visibility_data.items():
        # Skip if trying to update generic_products visibility
        if form_name == "generic_products":
            continue
            
        # Skip if the form doesn't exist
        if form_name not in forms_data:
            continue
            
        # If the form exists, add or update metadata if it doesn't exist
        if not isinstance(forms_data[form_name], dict) or "metadata" not in forms_data[form_name]:
            # Convert products array to an object with products and metadata
            products = forms_data[form_name]
            forms_data[form_name] = {
                "products": products,
                "metadata": {
                    "visible": is_visible
                }
            }
        else:
            # Update visibility in existing metadata
            forms_data[form_name]["metadata"]["visible"] = is_visible
    
    # Write updated forms data to file
    write_forms(forms_data)
    
    return jsonify({
        "success": True,
        "message": "Form visibility updated successfully"
    })


@app.route('/api/upload_image', methods=['POST'])
def upload_image():
    """Upload product image to public/images directory"""
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image file provided"
        }), 400
    
    image_file = request.files['image']
    
    # Check if filename is empty
    if image_file.filename == '':
        return jsonify({
            "success": False,
            "error": "No image selected"
        }), 400
    
    # Check if the file is a JPG/JPEG
    if not image_file.filename.lower().endswith(('.jpg', '.jpeg')):
        return jsonify({
            "success": False,
            "error": "Only JPG/JPEG files are allowed"
        }), 400
    
    # Use the provided filename or use the original one
    if 'fileName' in request.form:
        print(f"{request.form['fileName']=}")
        filename = request.form['fileName']
    else:
        print(f"{image_file.filename=}")
        filename = image_file.filename
    
    
    # Ensure it's a jpg extension
    if not filename.lower().endswith('.jpg'):
        filename = filename.rsplit('.', 1)[0] + '.jpg'
    
    print(f"{filename=}")

    # Save the file to the uploads folder
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    image_file.save(file_path)
    
    # Return success and the relative path
    return jsonify({
        "success": True,
        "imagePath": f"/images/{filename}"
    })

import os
import urllib.parse
import unicodedata
import logging
from flask import send_from_directory, jsonify

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/images/<path:filename>', methods=['GET'])
def get_image(filename):
    """Serve product images with proper Hebrew filename handling"""
    try:
        # Decode URL-encoded filename
        decoded_filename = urllib.parse.unquote(filename)
        logger.info(f"Requested image: {repr(decoded_filename)}")
        
        # Normalize Unicode and strip extra spaces
        normalized_filename = unicodedata.normalize('NFC', decoded_filename).strip()
        logger.info(f"Normalized filename: {repr(normalized_filename)}")
        
        # Try exact match first
        exact_path = os.path.join(UPLOAD_FOLDER, normalized_filename)
        if os.path.exists(exact_path):
            logger.info(f"Serving exact match: {normalized_filename}")
            return send_from_directory(UPLOAD_FOLDER, normalized_filename)
        
        # Try with .jpg extension
        jpg_filename = normalized_filename + '.jpg'
        jpg_path = os.path.join(UPLOAD_FOLDER, jpg_filename)
        if os.path.exists(jpg_path):
            logger.info(f"Serving JPG version: {jpg_filename}")
            return send_from_directory(UPLOAD_FOLDER, jpg_filename)
        
        # Case-insensitive search for Hebrew filenames
        if os.path.exists(UPLOAD_FOLDER):
            for file in os.listdir(UPLOAD_FOLDER):
                # Normalize and strip directory filenames
                normalized_file = unicodedata.normalize('NFC', file).strip()
                
                # Compare normalized names
                if normalized_filename == normalized_file:
                    logger.info(f"Found normalized match: {file}")
                    return send_from_directory(UPLOAD_FOLDER, file)
                
                # Compare with .jpg extension
                if normalized_filename + '.jpg' == normalized_file:
                    logger.info(f"Found normalized JPG match: {file}")
                    return send_from_directory(UPLOAD_FOLDER, file)
                
                # Case-insensitive comparison
                if normalized_filename.lower() == normalized_file.lower():
                    logger.info(f"Found case-insensitive match: {file}")
                    return send_from_directory(UPLOAD_FOLDER, file)
                
                # Case-insensitive comparison with .jpg extension
                if (normalized_filename + '.jpg').lower() == normalized_file.lower():
                    logger.info(f"Found case-insensitive JPG match: {file}")
                    return send_from_directory(UPLOAD_FOLDER, file)
        
        # Log directory contents for debugging
        files = os.listdir(UPLOAD_FOLDER)
        logger.error(f"Image not found. Directory contents: {files}")
        
        return jsonify({
            "success": False,
            "error": f"Image not found: {normalized_filename}",
            "searched_files": files,
            "normalized_request": normalized_filename,
            "original_request": decoded_filename
        }), 404
        
    except Exception as e:
        logger.exception(f"Error retrieving image: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500


@app.route('/api/products/generic_products', methods=['GET'])
def get_generic_products():
    """Get generic products for homepage"""
    forms_data = read_forms()
    
    if "generic_products" in forms_data:
        # Return only products that exist
        existent_products = [
            p for p in forms_data["generic_products"].get("products", [])
            if p.get("existent", True)
        ]
        return jsonify({
            "success": True,
            "products": existent_products
        })
    else:
        return jsonify({
            "success": False,
            "error": "Generic products not found"
        }), 404

# Update create_form route to include default comment
@app.route('/api/forms', methods=['POST'])
def create_form():
    """Create a new form with products from the generic product data"""
    data = request.json
    
    # Validate required fields
    if 'formName' not in data:
        return jsonify({
            "success": False,
            "error": "Form name is required"
        }), 400
    
    form_name = data['formName']
    forms_data = read_forms()
    
    # Check if form already exists
    if form_name in forms_data:
        return jsonify({
            "success": False,
            "error": "Form with this name already exists"
        }), 409
    
    # Create new form with products from generic_products
    if "generic_products" in forms_data:
        # Use generic products as template
        if isinstance(forms_data["generic_products"], dict) and "products" in forms_data["generic_products"]:
            template_products = copy.deepcopy(forms_data["generic_products"]["products"])
        else:
            template_products = copy.deepcopy(forms_data["generic_products"])
    else:
        # Fallback to default product data if generic_products doesn't exist
        template_products = copy.deepcopy(product_data["generic_products"])
        # Add generic_products to forms_data
        forms_data["generic_products"] = template_products
    
    # Create new form with the new structure including default comment
    forms_data[form_name] = {
        "products": template_products,
        "metadata": {
            "visible": True  # Default to visible
        },
        "comment": "The bread comes sliced unless you specify otherwise here. You can also add additional notes here."
    }
    
    write_forms(forms_data)
    
    orders_data = read_orders()
    
    orders_data[form_name] = {"orders": [], "products": {}}
    
    write_orders(orders_data)


    return jsonify({
        "success": True,
        "formName": form_name
    })


@app.route('/api/forms/<form_name>', methods=['PUT'])
def update_form(form_name):
    """Update products for a form while preserving the order"""
    data = request.json
    
    if 'products' not in data:
        return jsonify({
            "success": False,
            "error": "Products data is required"
        }), 400
    
    forms_data = read_forms()

    
    # Check if form exists
    if form_name not in forms_data:
        return jsonify({
            "success": False,
            "error": "Form not found"
        }), 404
    
    # Get existing metadata if available
    metadata = {"visible": True}  # Default metadata
    if isinstance(forms_data[form_name], dict) and "metadata" in forms_data[form_name]:
        metadata = forms_data[form_name]["metadata"]
    
    # Get comment if provided, or use existing one, or use default
    comment = data.get('comment', '')
    if isinstance(forms_data[form_name], dict) and "comment" in forms_data[form_name]:
        # Use existing comment if no new one provided
        if not comment:
            comment = forms_data[form_name]["comment"]
    
    products_data = read_orders()[form_name]["products"]

    # Process products to ensure inventory and soldOut are set correctly
    # IMPORTANT: Maintain the exact order that was sent from the frontend
    processed_products = []
    for product in data['products']:  # This maintains the order from the frontend
        # Set default inventory to 12 if not provided
        inventory = product.get('inventory', 12)
        
        # Ensure soldOut is set based on inventory
        soldOut = (inventory == (products_data.get(product["name"], {}).get("total_amount", 0)))
        
        processed_product = {
            **product,
            'inventory': inventory,
            'soldOut': soldOut
        }
        processed_products.append(processed_product)
    
    # Update the form's products with the new structure including comment
    # The order of products in the list will now match the UI order
    forms_data[form_name] = {
        "products": processed_products,  # Order is preserved from frontend
        "metadata": metadata,
        "comment": comment
    }
    
    write_forms(forms_data)
    
    return jsonify({
        "success": True,
        "formName": form_name,
        "productCount": len(processed_products)
    })


@app.route('/api/products/<date>', methods=['GET'])
def get_products(date):
    """Get products for a specific date"""
    forms_data = read_forms()

    if date=="generic_products":
        products_data = {}
    else:
        products_data = read_orders()[date]["products"]

    print("products_data:")
    print(products_data)

    if date in forms_data:
        # Check if the data structure has been updated
        if isinstance(forms_data[date], dict) and "products" in forms_data[date]:
            # Ensure each product has an inventory (default to 12 if not set)
            products = forms_data[date]["products"]
            for product in products:
                if 'inventory' not in product:
                    product['inventory'] = 12
                # Update soldOut based on inventory
                product['soldOut'] = (product.get('inventory', 0) == (products_data.get(product["name"], {}).get("total_amount", 0)))
            
            # Return products, metadata, and comment if available
            return jsonify({
                "success": True,
                "products": products,
                "metadata": forms_data[date].get("metadata", {"visible": True}),
                "comment": forms_data[date].get("comment", "The bread comes sliced unless you specify otherwise here. You can also add additional notes here.")
            })
        else:
            # Return old format for backward compatibility
            return jsonify({
                "success": True,
                "products": forms_data[date],
                "metadata": {"visible": True},
                "comment": "The bread comes sliced unless you specify otherwise here. You can also add additional notes here."
            })
    else:
        return jsonify({
            "success": False,
            "error": "Date not found"
        }), 404


@app.route('/api/udpate_sourdough', methods=['PUT'])
def update_sourdough_amounts():
    data = request.json

    forms_data = read_forms()

    if "generic_products" not in forms_data:
        return jsonify({
            "success": False,
            "error": "Generic products not found"
        }), 404

    products = forms_data["generic_products"].get("products", [])

    for i in range(len(products)):
        product = products[i]
        product_name = product["name"]
        if product_name in data['amounts']:
            update = data['amounts'][product_name]
            # Update legacy fields
            product["sourdough_black"] = update.get("black", 0)
            product["sourdough_half_half"] = update.get("halfHalf", 0)
            product["sourdough_white"] = update.get("white", 0)
            # Update new fields
            product["flour"] = update.get("flour", 0)
            product["water"] = update.get("water", 0)
            product["salt"] = update.get("salt", 0)
            product["flours"] = update.get("flours", [])
            
        products[i] = product

    forms_data["generic_products"]["products"] = products
    write_forms(forms_data)

    return jsonify({"success": True})

# Helper function to find order by ID
def find_order(order_id):
    orders_data = read_orders()
    for form_name, form_data in orders_data.items():
        for idx, order in enumerate(form_data["orders"]):
            if order["id"] == order_id:
                return form_name, idx, order
    return None, None, None

# Get order by ID
@app.route('/api/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    form_name, idx, order = find_order(order_id)
    if not order:
        return jsonify({"success": False, "error": "Order not found"}), 404
    return jsonify({"success": True, "order": order})

# Update existing order
@app.route('/api/orders/<order_id>', methods=['PUT'])
def update_order(order_id):
    form_name, idx, old_order = find_order(order_id)
    if not old_order:
        return jsonify({"success": False, "error": "Order not found"}), 404
    
    data = request.json
    orders_data = read_orders()
    
    # Update order details
    updated_order = {
        **old_order,
        "phone": data.get("phone", old_order["phone"]),
        "comment": data.get("comment", old_order["comment"]),
        "selectedProducts": data.get("selectedProducts", old_order["selectedProducts"]),
        "totalAmount": data.get("totalAmount", old_order["totalAmount"])
    }
    
    # Replace the order in the list
    orders_data[form_name]["orders"][idx] = updated_order
    
    # Recalculate aggregates
    recalc_aggregates(orders_data, form_name)
    write_orders(orders_data)
    
    return jsonify({"success": True, "order": updated_order})

# Delete an order
@app.route('/api/orders/<order_id>', methods=['DELETE'])
def remove_order(order_id):
    form_name, idx, order = find_order(order_id)
    if not order:
        return jsonify({"success": False, "error": "Order not found"}), 404
    
    orders_data = read_orders()
    # Remove the order
    del orders_data[form_name]["orders"][idx]
    
    # Recalculate aggregates
    recalc_aggregates(orders_data, form_name)
    write_orders(orders_data)
    
    return jsonify({"success": True})

# Helper to recalculate aggregates after changes
def recalc_aggregates(orders_data, form_name):
    products_agg = {}
    for order in orders_data[form_name]["orders"]:
        for product_name, product in order["selectedProducts"].items():
            if product_name not in products_agg:
                products_agg[product_name] = {"total_amount":0, "extras": {}}
            for extra_name, amount in product["extras"].items():
                if extra_name not in products_agg[product_name]["extras"]:
                    products_agg[product_name]["extras"][extra_name] = {"amount":0, "names": []}
                products_agg[product_name]["extras"][extra_name]["amount"] += amount
                products_agg[product_name]["extras"][extra_name]["names"].append(order["name"])
            products_agg[product_name]["total_amount"] += amount
    orders_data[form_name]["products"] = products_agg


@app.route('/api/orders/products_ordered', methods=['GET'])
def get_products_ordered():
    # Get form_name from query parameters
    form_name = request.args.get('form_name')
    
    # Validate form_name parameter
    if not form_name:
        return jsonify({
            "success": False,
            "error": "form_name parameter is required"
        }), 400
    
    # Read orders data
    orders_data = read_orders()
    
    # Check if form exists
    if form_name not in orders_data:
        return jsonify({
            "success": False,
            "error": f"Form '{form_name}' not found"
        }), 404
    
    # Get products data for the form
    form_data = orders_data[form_name]
    
    # Initialize result dictionary
    result = {}
    
    # Extract total amounts for each product
    if "products" in form_data:
        for product_name, product_data in form_data["products"].items():
            result[product_name] = product_data.get("total_amount", 0)
    
    return jsonify({
        "success": True,
        "dict": result
    })

@app.route('/api/orders/<order_id>/move', methods=['POST'])
def move_order(order_id):
    data = request.json
    if 'target_form' not in data:
        return jsonify({"success": False, "error": "target_form parameter is required"}), 400
    
    target_form = data['target_form']
    orders_data = read_orders()
    
    # Find the original order
    form_name, idx, order = find_order(order_id)
    if not order:
        return jsonify({"success": False, "error": "Order not found"}), 404
    
    # Check if target form exists
    if target_form not in orders_data:
        return jsonify({"success": False, "error": "Target form not found"}), 404
    
    # Get target form's products
    forms_data = read_forms()
    if target_form not in forms_data:
        return jsonify({"success": False, "error": "Target form products not found"}), 404
    
    # Validate products exist in target form
    target_products = forms_data[target_form]["products"]
    target_product_names = [p["name"] for p in target_products]
    
    for product_name in order["selectedProducts"].keys():
        if product_name not in target_product_names:
            return jsonify({
                "success": False,
                "error": f"Product '{product_name}' not available in target form"
            }), 400
    
    # Validate inventory in target form
    try:
        # Get products ordered in target form
        target_orders = orders_data[target_form]["orders"]
        target_products_ordered = {}
        for o in target_orders:
            for p_name, p_data in o["selectedProducts"].items():
                if p_name not in target_products_ordered:
                    target_products_ordered[p_name] = 0
                for extra, amount in p_data["extras"].items():
                    target_products_ordered[p_name] += amount
        
        # Check against target form inventory
        for p_name, p_data in order["selectedProducts"].items():
            # Find product in target form
            target_product = next((p for p in target_products if p["name"] == p_name), None)
            if not target_product:
                continue
            
            # Calculate total ordered amount
            ordered_amount = sum(p_data["extras"].values())
            
            # Get available inventory
            available = target_product["inventory"]
            already_ordered = target_products_ordered.get(p_name, 0)
            remaining = available - already_ordered
            
            if ordered_amount > remaining:
                return jsonify({
                    "success": False,
                    "error": f"Not enough inventory for '{p_name}' in target form (only {remaining} available)"
                }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Inventory validation failed: {str(e)}"
        }), 500
    
    # Create a copy of the order for the target form
    new_order = copy.deepcopy(order)
    new_order["date"] = target_form
    new_order["timestamp"] = datetime.now().isoformat()
    
    # Add to target form
    orders_data[target_form]["orders"].append(new_order)
    
    # Update aggregates for target form
    recalc_aggregates(orders_data, target_form)
    
    # Remove from original form
    del orders_data[form_name]["orders"][idx]
    
    # Update aggregates for original form
    recalc_aggregates(orders_data, form_name)
    
    # Save changes
    write_orders(orders_data)
    
    return jsonify({
        "success": True,
        "message": "Order moved successfully",
        "new_form": target_form
    })


if __name__ == '__main__':
    app.run(port=5000, host="0.0.0.0")