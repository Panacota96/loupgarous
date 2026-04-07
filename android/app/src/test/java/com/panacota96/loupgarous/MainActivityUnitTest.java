package com.panacota96.loupgarous;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class MainActivityUnitTest {

    @Test
    public void packageName_isStable() {
        assertEquals("com.panacota96.loupgarous", MainActivity.class.getPackage().getName());
    }
}
