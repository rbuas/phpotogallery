<?php
function XMLParseStr ( $xml, $version = "1.0", $encoding = "UTF-8" ) {
   //create new object to parse xml
   $domparser = new DOMDocument( $version , $encoding );

   //load xml in parser
   $xml_loaded = @$domparser->loadXML( $xml );
   if( !$xml_loaded ) {
       return NULL;
   }

   //save xml data in array
   $xml_parsed = array();
   if( !XMLParseNodeR( $domparser->documentElement, $xml_parsed ) )
      return NULL;

   //return xml data array
   return $xml_parsed;
}


function XMLParseNodeR ( $node, &$parent ) {
   //testing node type
   if( $node->nodeType != XML_ELEMENT_NODE )
      return false;

   //create array to readed node
   $nodeparsed = array();

   //reading attributes
   if( $node->hasAttributes() ) {
      foreach( $node->attributes as $i => $att ) {
         XMLStoreValue( $att->name, $att->value, $nodeparsed );
      }
    }

   //reading child
   if( $node->hasChildNodes() ) {
      $child = $node->childNodes;
      for( $i = 0; $i < $child->length; $i++ ) {
		 $child_node = $child->item( $i );

		 //decide how to read node
         if( $child_node->nodeType == XML_TEXT_NODE ) {
		    //if is a text store value in array
            XMLStoreValue( $child_node->nodeName, $child_node->nodeValue, $nodeparsed );
         } else {
			//if is other node call recursion	 
		    XMLParseNodeR( $child_node, $nodeparsed );
         }
      }
   }

   //store readed values in array 
   XMLStoreValue( $node->nodeName, $nodeparsed, $parent );
   return true;
}


function XMLStoreValue ( $key, $val, &$arr ) {
   if( !is_array( $arr ) )
      return;
   
   if( $key == NULL )
      return;
   $key = trim( $key );
   if( $key == "" )
      return;

   if( is_string( $val ) ) {
      $val = trim( $val );
      if( $val == NULL || $val == "" )
         return;
   }

   if( !isset( $arr[ $key ] ) ) {
      $arr[ $key ] = $val;
	  return;
   }
   
   if( is_array( $arr[ $key ] ) && is_array( $val ) ) {
      foreach( $arr[ $key ] as $k => $v ) {
         if( isset( $val[ $k ] ) )
            XMLStoreValue( $k, $val[ $k ], $arr[ $key ]);
	  }
	  return;
  }
   
   if( is_array( $arr[ $key ] ) ) {
      $arr[ $key ][] = $val;
   } else {
      $old = $arr[ $key ];
      $arr[ $key ] = array( $old, $val );
   }
}
?>
